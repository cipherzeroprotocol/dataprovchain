/**
 * Provenance record model
 */
module.exports = (sequelize, DataTypes) => {
    const ProvenanceRecord = sequelize.define('ProvenanceRecord', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      datasetId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Datasets',
          key: 'id'
        }
      },
      actionType: {
        type: DataTypes.ENUM('creation', 'modification', 'derivation', 'usage', 'verification', 'transfer', 'storage_confirmed', 'storage_failed'),
        allowNull: false
      },
      performedBy: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      ipfsCid: {
        type: DataTypes.STRING,
        allowNull: true
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
      },
      previousRecordId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'ProvenanceRecords',
          key: 'id'
        }
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['datasetId']
        },
        {
          fields: ['actionType']
        },
        {
          fields: ['performedBy']
        },
        {
          fields: ['previousRecordId']
        }
      ]
    });
    
    ProvenanceRecord.associate = function(models) {
      ProvenanceRecord.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      ProvenanceRecord.belongsTo(models.User, { foreignKey: 'performedBy', targetKey: 'walletAddress', as: 'performer' });
      ProvenanceRecord.belongsTo(ProvenanceRecord, { foreignKey: 'previousRecordId', as: 'previousRecord' });
      ProvenanceRecord.hasMany(ProvenanceRecord, { foreignKey: 'previousRecordId', as: 'nextRecords' });
    };
    
    return ProvenanceRecord;
  };