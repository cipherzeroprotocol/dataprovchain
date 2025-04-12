// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IDatasetRegistry.sol";
import "./libraries/DataTypes.sol";

/**
 * @title VerificationRegistry
 * @dev Contract for managing dataset verification processes and credentials
 */
contract VerificationRegistry is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Counter for verification request IDs
    Counters.Counter private _requestIds;
    
    // DatasetRegistry contract reference
    IDatasetRegistry public datasetRegistry;
    
    // Verification request status
    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Completed
    }
    
    // Verification request
    struct VerificationRequest {
        uint256 id;
        uint256 datasetId;
        address requester;
        string method;
        string details;
        address assignedVerifier;
        VerificationStatus status;
        uint256 requestTime;
        uint256 completionTime;
        string result;
        string feedback;
    }
    
    // Mapping from request ID to verification request
    mapping(uint256 => VerificationRequest) private _verificationRequests;
    
    // Mapping from dataset ID to verification request IDs
    mapping(uint256 => uint256[]) private _datasetVerificationRequests;
    
    // Mapping from verifier to assigned request IDs
    mapping(address => uint256[]) private _verifierAssignments;
    
    // Mapping from dataset ID to verification records
    mapping(uint256 => DataTypes.VerificationRecord[]) private _verificationRecords;
    
    // Verification fee amount
    uint256 public verificationFee;
    
    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        uint256 indexed datasetId,
        address indexed requester,
        uint256 timestamp
    );
    
    event VerifierAssigned(
        uint256 indexed requestId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event VerificationCompleted(
        uint256 indexed requestId,
        uint256 indexed datasetId,
        address indexed verifier,
        string result,
        uint256 timestamp
    );
    
    event VerificationFeeUpdated(
        uint256 fee,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor for the VerificationRegistry contract
     * @param _datasetRegistry Address of the DatasetRegistry contract
     * @param _initialFee Initial verification fee
     */
    constructor(address _datasetRegistry, uint256 _initialFee) {
        require(_datasetRegistry != address(0), "VerificationRegistry: Invalid dataset registry address");
        
        datasetRegistry = IDatasetRegistry(_datasetRegistry);
        verificationFee = _initialFee;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Set the verification fee
     * @param _fee New verification fee
     */
    function setVerificationFee(uint256 _fee) external onlyRole(ADMIN_ROLE) {
        verificationFee = _fee;
        
        emit VerificationFeeUpdated(_fee, block.timestamp);
    }
    
    /**
     * @dev Add a verifier
     * @param verifier Address of the verifier
     */
    function addVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        require(verifier != address(0), "VerificationRegistry: Invalid verifier address");
        
        grantRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Remove a verifier
     * @param verifier Address of the verifier
     */
    function removeVerifier(address verifier) external onlyRole(ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Request verification for a dataset
     * @param datasetId ID of the dataset
     * @param method Verification method
     * @param details Additional details about the verification request
     */
    function requestVerification(
        uint256 datasetId,
        string memory method,
        string memory details
    ) 
        external 
        payable 
        nonReentrant 
    {
        // Ensure the dataset exists
        DataTypes.DatasetMetadata memory metadata = datasetRegistry.getDatasetMetadata(datasetId);
        require(metadata.creator != address(0), "VerificationRegistry: Dataset does not exist");
        
        // Ensure the dataset is not already verified
        require(!metadata.isVerified, "VerificationRegistry: Dataset already verified");
        
        // Ensure the fee is paid
        require(msg.value >= verificationFee, "VerificationRegistry: Insufficient fee");
        
        // Create verification request
        _requestIds.increment();
        uint256 requestId = _requestIds.current();
        
        VerificationRequest memory request = VerificationRequest({
            id: requestId,
            datasetId: datasetId,
            requester: msg.sender,
            method: method,
            details: details,
            assignedVerifier: address(0),
            status: VerificationStatus.Pending,
            requestTime: block.timestamp,
            completionTime: 0,
            result: "",
            feedback: ""
        });
        
        // Store verification request
        _verificationRequests[requestId] = request;
        _datasetVerificationRequests[datasetId].push(requestId);
        
        emit VerificationRequested(requestId, datasetId, msg.sender, block.timestamp);
        
        // Refund any excess fee
        if (msg.value > verificationFee) {
            payable(msg.sender).transfer(msg.value - verificationFee);
        }
    }
    
    /**
     * @dev Assign a verifier to a verification request
     * @param requestId ID of the verification request
     * @param verifier Address of the verifier
     */
    function assignVerifier(uint256 requestId, address verifier) external onlyRole(ADMIN_ROLE) {
        require(_verificationRequests[requestId].id != 0, "VerificationRegistry: Request does not exist");
        require(_verificationRequests[requestId].status == VerificationStatus.Pending, "VerificationRegistry: Request not pending");
        require(hasRole(VERIFIER_ROLE, verifier), "VerificationRegistry: Address is not a verifier");
        
        _verificationRequests[requestId].assignedVerifier = verifier;
        _verificationRequests[requestId].status = VerificationStatus.Approved;
        
        _verifierAssignments[verifier].push(requestId);
        
        emit VerifierAssigned(requestId, verifier, block.timestamp);
    }
    
    /**
     * @dev Complete a verification request
     * @param requestId ID of the verification request
     * @param result Result of the verification (VERIFIED or REJECTED)
     * @param feedback Additional feedback
     */
    function completeVerification(
        uint256 requestId,
        string memory result,
        string memory feedback
    ) 
        external 
        nonReentrant 
    {
        VerificationRequest storage request = _verificationRequests[requestId];
        
        require(request.id != 0, "VerificationRegistry: Request does not exist");
        require(request.status == VerificationStatus.Approved, "VerificationRegistry: Request not approved");
        require(
            request.assignedVerifier == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "VerificationRegistry: Not authorized"
        );
        
        // Update request status
        request.status = VerificationStatus.Completed;
        request.completionTime = block.timestamp;
        request.result = result;
        request.feedback = feedback;
        
        // Create verification record
        DataTypes.VerificationRecord memory record = DataTypes.VerificationRecord({
            datasetId: request.datasetId,
            verifier: request.assignedVerifier,
            method: request.method,
            result: result,
            timestamp: block.timestamp,
            details: feedback
        });
        
        // Store verification record
        _verificationRecords[request.datasetId].push(record);
        
        emit VerificationCompleted(requestId, request.datasetId, request.assignedVerifier, result, block.timestamp);
        
        // If verification was successful, mark the dataset as verified in the DatasetRegistry
        if (keccak256(bytes(result)) == keccak256(bytes("VERIFIED"))) {
            try datasetRegistry.verifyDataset(request.datasetId) {
                // Verification successful
            } catch {
                // Verification failed in DatasetRegistry, but we still mark it as completed here
            }
        }
    }
    
    /**
     * @dev Get verification request
     * @param requestId ID of the verification request
     * @return Verification request
     */
    function getVerificationRequest(uint256 requestId) external view returns (VerificationRequest memory) {
        require(_verificationRequests[requestId].id != 0, "VerificationRegistry: Request does not exist");
        return _verificationRequests[requestId];
    }
    
    /**
     * @dev Get verification records for a dataset
     * @param datasetId ID of the dataset
     * @return Array of verification records
     */
    function getVerificationRecords(uint256 datasetId) external view returns (DataTypes.VerificationRecord[] memory) {
        return _verificationRecords[datasetId];
    }
    
    /**
     * @dev Get verification requests for a dataset
     * @param datasetId ID of the dataset
     * @return Array of verification request IDs
     */
    function getDatasetVerificationRequests(uint256 datasetId) external view returns (uint256[] memory) {
        return _datasetVerificationRequests[datasetId];
    }
    
    /**
     * @dev Get assigned verification requests for a verifier
     * @param verifier Address of the verifier
     * @return Array of verification request IDs
     */
    function getVerifierAssignments(address verifier) external view returns (uint256[] memory) {
        return _verifierAssignments[verifier];
    }
    
    /**
     * @dev Withdraw fees
     * @param amount Amount to withdraw
     * @param recipient Recipient address
     */
    function withdrawFees(uint256 amount, address recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "VerificationRegistry: Invalid recipient address");
        require(amount > 0 && amount <= address(this).balance, "VerificationRegistry: Invalid amount");
        
        payable(recipient).transfer(amount);
    }
}