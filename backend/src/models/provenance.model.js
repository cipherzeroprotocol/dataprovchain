/**
 * Provenance data model
 * Tracks the complete lineage of datasets in the system
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schemas for each component of provenance

// Actor represents an entity that performs an action (user, system, etc.)
const ActorSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['user', 'system', 'organization', 'service', 'algorithm'],
    required: true
  },
  name: { type: String, required: true },
  identifiers: {
    email: { type: String },
    walletAddress: { type: String },
    publicKey: { type: String },
    url: { type: String }
  },
  metadata: { type: Schema.Types.Mixed }
}, { _id: false });

// Location represents where the action took place
const LocationSchema = new Schema({
  type: { 
    type: String, 
    enum: ['geographic', 'network', 'storage', 'virtual'],
    required: true
  },
  identifier: { type: String, required: true },
  details: { type: Schema.Types.Mixed }
}, { _id: false });

// Activity represents a specific action performed on or with data
const ActivitySchema = new Schema({
  type: { 
    type: String, 
    enum: ['creation', 'transformation', 'aggregation', 'extraction', 'validation', 
           'publication', 'access', 'transfer', 'deletion', 'other'],
    required: true
  },
  description: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  parameters: { type: Schema.Types.Mixed },
  software: {
    name: { type: String },
    version: { type: String },
    configuration: { type: Schema.Types.Mixed }
  },
  location: { type: LocationSchema },
  inputs: [{
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset' },
    version: { type: String },
    contentHash: { type: String },
    uri: { type: String },
    role: { type: String }
  }],
  documentation: { type: String }
}, { _id: false });

// Transform represents a specific data transformation
const TransformSchema = new Schema({
  type: { 
    type: String, 
    enum: ['cleaning', 'normalization', 'aggregation', 'filtering', 'enrichment', 
           'anonymization', 'format_conversion', 'feature_extraction', 'other'],
    required: true
  },
  description: { type: String, required: true },
  code: { type: String },
  parameters: { type: Schema.Types.Mixed },
  dataChanges: {
    fieldsAdded: [String],
    fieldsRemoved: [String],
    fieldsModified: [String],
    recordsFiltered: Number,
    qualityMetrics: { type: Schema.Types.Mixed }
  }
}, { _id: false });

// License and usage terms
const LicenseSchema = new Schema({
  type: { 
    type: String, 
    enum: ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc', 'cc-by-nd', 'cc-by-nc-sa', 
           'cc-by-nc-nd', 'apache-2.0', 'mit', 'gpl-3.0', 'custom', 'none'],
    required: true
  },
  customText: { type: String },
  url: { type: String },
  attributionText: { type: String },
  permissions: {
    commercial: { type: Boolean, default: false },
    derivatives: { type: Boolean, default: false },
    distribution: { type: Boolean, default: false },
    research: { type: Boolean, default: true }
  },
  constraints: [String],
  termsVersion: { type: String }
}, { _id: false });

// Main Provenance Record Schema
const ProvenanceSchema = new Schema({
  datasetId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Dataset',
    required: true
  },
  version: { 
    type: String,
    required: true 
  },
  contentHash: { 
    type: String,
    required: true 
  },
  creator: { 
    type: ActorSchema,
    required: true 
  },
  createdAt: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  activities: [ActivitySchema],
  transforms: [TransformSchema],
  parentDatasets: [{
    datasetId: { type: Schema.Types.ObjectId, ref: 'Dataset' },
    version: { type: String },
    contentHash: { type: String },
    relationshipType: { 
      type: String, 
      enum: ['derived_from', 'extracted_from', 'subset_of', 'aggregated_with']
    }
  }],
  license: { 
    type: LicenseSchema,
    required: true 
  },
  attestations: [{
    type: { 
      type: String, 
      enum: ['signature', 'certificate', 'witness', 'blockchain_proof'],
      required: true
    },
    createdAt: { type: Date, required: true, default: Date.now },
    createdBy: { type: ActorSchema, required: true },
    value: { type: String, required: true },
    verificationUrl: { type: String }
  }],
  blockchain: {
    recorded: { type: Boolean, default: false },
    network: { type: String },
    transactionHash: { type: String },
    blockNumber: { type: Number },
    timestamp: { type: Date },
    contractAddress: { type: String },
    proofType: { 
      type: String, 
      enum: ['hash_only', 'merkle_proof', 'zkp', 'full_data']
    }
  },
  storage: {
    filecoin: {
      cid: { type: String },
      dealId: { type: String },
      expirationEpoch: { type: Number }
    },
    ipfs: {
      cid: { type: String }
    },
    other: [{
      type: { type: String, required: true },
      identifier: { type: String, required: true },
      metadata: { type: Schema.Types.Mixed }
    }]
  },
  quality: {
    completeness: { type: Number, min: 0, max: 1 },
    accuracy: { type: Number, min: 0, max: 1 },
    timeliness: { type: Number, min: 0, max: 1 },
    consistency: { type: Number, min: 0, max: 1 },
    metrics: { type: Schema.Types.Mixed }
  },
  linkedSchemas: [{
    type: { type: String, required: true },
    url: { type: String, required: true },
    mappings: { type: Schema.Types.Mixed }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'deprecated', 'archived', 'invalid'],
    default: 'draft'
  },
  accessHistory: [{
    actor: { type: ActorSchema },
    timestamp: { type: Date, required: true, default: Date.now },
    action: { 
      type: String, 
      enum: ['read', 'download', 'update', 'delete', 'share'],
      required: true
    },
    location: { type: LocationSchema },
    purpose: { type: String }
  }],
  metadataStandard: {
    name: { type: String },
    version: { type: String },
    url: { type: String }
  }
}, {
  timestamps: true,
  collection: 'provenance'
});

// Add compound index for dataset ID + version
ProvenanceSchema.index({ datasetId: 1, version: 1 }, { unique: true });

// Add index for content hash
ProvenanceSchema.index({ contentHash: 1 });

// Add text index for searching
ProvenanceSchema.index({
  'creator.name': 'text',
  'activities.description': 'text',
  'transforms.description': 'text'
});

// Virtual for full lineage calculation
ProvenanceSchema.virtual('fullLineage').get(function() {
  // This would be implemented in the service layer
  // to recursively traverse the parent datasets
  return this.parentDatasets;
});

// Instance method for generating provenance summary
ProvenanceSchema.methods.getSummary = function() {
  return {
    id: this._id,
    dataset: this.datasetId,
    version: this.version,
    creator: this.creator.name,
    createdAt: this.createdAt,
    activityCount: this.activities.length,
    transformCount: this.transforms.length,
    parentCount: this.parentDatasets.length,
    license: this.license.type,
    blockchainRecorded: this.blockchain.recorded,
    status: this.status
  };
};

// Static method for finding related provenance records
ProvenanceSchema.statics.findRelated = function(datasetId) {
  return this.find({
    $or: [
      { datasetId: datasetId },
      { 'parentDatasets.datasetId': datasetId }
    ]
  });
};

const Provenance = mongoose.model('Provenance', ProvenanceSchema);

module.exports = Provenance;
