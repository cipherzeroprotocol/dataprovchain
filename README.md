# DataProvChain 

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.17-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green.svg)](https://nodejs.org/)
[![Filecoin](https://img.shields.io/badge/Filecoin-Calibration-green.svg)](https://filecoin.io/)

DataProvChain is a decentralized platform for AI training dataset provenance, attribution, and marketplace built on Filecoin/IPFS. It creates verifiable, traceable data lineage for AI models, ensures proper attribution, and enables a transparent marketplace for AI datasets.

## 🔍 Overview

DataProvChain solves critical problems in the AI ecosystem:

- **Provenance Tracking**: Creates a verifiable chain of data lineage from source to AI model
- **Fair Attribution**: Ensures dataset creators receive recognition and compensation
- **Marketplace**: Enables secure buying and selling of AI datasets with clear licensing
- **Decentralized Storage**: Leverages Filecoin/IPFS for resilient, decentralized data storage
- **Governance**: Implements DAO-based governance for dataset quality standards

## ✨ Key Features

- 📊 **Dataset Registration & NFT Minting**: Register datasets and receive NFTs representing ownership
- 🔗 **Provenance Graph Visualization**: Interactive visualization of dataset lineage
- 💰 **Royalty Distribution**: Automated royalty payments to dataset contributors
- 🛒 **Dataset Marketplace**: Buy and sell datasets with flexible licensing options
- 🗳️ **DataDAO Governance**: Community-driven standards and decision making
- 🔐 **Verifiable Attestations**: Cryptographic verification of data provenance claims
- ☁️ **Filecoin Integration**: Permanent, decentralized storage for datasets

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher) or Yarn (v1.22.0 or higher)
- Git
- PostgreSQL (v13.0 or higher)
- MetaMask or other Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dataprovchain.git
cd dataprovchain
```

2. Create a `.env` file in the root directory with the following variables:
```
# Blockchain
PRIVATE_KEY=your_private_key_here
FILECOIN_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
HARDHAT_NETWORK=calibrationnet

# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/dataprovchain
JWT_SECRET=your_jwt_secret
PORT=3001

# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_CHAIN_ID=314159
```

3. Install dependencies:
```bash
# Root directory
npm install

# Smart contracts
cd contracts
npm install

# Backend
cd ../backend
npm install

# Frontend
cd ../frontend
npm install
```

4. Deploy smart contracts:
```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy/deploy_all.js --network calibrationnet
```

5. Set up the database and start the backend:
```bash
cd backend
npm run migrate
npm run dev
```

6. Start the frontend:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- [Architecture Overview](./docs/architecture/overview.md)
- [Smart Contract Documentation](./docs/contracts/registry.md)
- [API Documentation](./docs/api/endpoints.md)
- [User Guides](./docs/user-guides/data-providers.md)
- [Developer Guides](./docs/developer-guides/getting-started.md)
- [Filecoin Integration](./docs/integration/filecoin.md)

## 🏗️ Project Structure

```
dataprovchain/
├── contracts/               # Smart contract code
├── backend/                 # Backend API server
├── frontend/                # React frontend application
├── filecoin/                # Filecoin integration utilities
├── docs/                    # Documentation
├── scripts/                 # Deployment and utility scripts
└── test/                    # Test files
```

## 💡 Use Cases

### For Data Providers
- Register and monetize datasets
- Receive attribution and royalties when datasets are used
- Build reputation through verified dataset contributions

### For AI Developers
- Discover high-quality, verified datasets
- Ensure compliance with dataset licenses and terms
- Provide transparent attribution for training data

### For the AI Community
- Establish standards for dataset quality and provenance
- Create a more equitable ecosystem for data creators
- Enable verification of model training claims

## 🛠️ Development Roadmap

### Phase 1: Core Platform (Current)
- Smart contract development
- Backend API implementation
- Frontend application
- Filecoin integration

### Phase 2: Enhanced Features
- Advanced provenance visualization
- AI framework integration SDKs
- Enhanced verification mechanisms
- Mobile application

### Phase 3: Ecosystem Growth
- Cross-chain functionality
- Specialized marketplaces for different AI domains
- Advanced governance mechanisms
- Reputation systems

## 🧪 Testing

Run smart contract tests:
```bash
cd contracts
npx hardhat test
```

Run backend tests:
```bash
cd backend
npm test
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [CONTRIBUTING.md](./CONTRIBUTING.md) file for more details.

## 🔐 Security

If you discover a security vulnerability, please send an e-mail to security@dataprovchain.com. All security vulnerabilities will be promptly addressed.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

## 📬 Contact

For questions or support, please open an issue or contact the team at info@dataprovchain.com.

---

Built with ❤️ by the DataProvChain Team
