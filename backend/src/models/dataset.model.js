/**
 * Dataset model
 */
module.exports = (sequelize, DataTypes) => {
    const Dataset = sequelize.define('Dataset', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      dataType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      cid: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tokenId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadataUri: {
        type: DataTypes.STRING,
        allowNull: true
      },
      license: {
        type: DataTypes.STRING,
        allowNull: false
      },
      creator: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileSize: {
        type: DataTypes.BIGINT,
        allowNull: true
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verifier: {
        type: DataTypes.STRING,
        allowNull: true
      },
      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      dealId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      dealConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['creator']
        },
        {
          unique: true,
          fields: ['tokenId']
        },
        {
          fields: ['dataType']
        },
        {
          fields: ['verified']
        }
      ]
    });
    
    Dataset.associate = function(models) {
      Dataset.belongsTo(models.User, { foreignKey: 'creator', as: 'creatorUser' });
      Dataset.hasMany(models.Contributor, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.Tag, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.ProvenanceRecord, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.Usage, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.Listing, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.Royalty, { foreignKey: 'datasetId' });
      Dataset.hasMany(models.AccessGrant, { foreignKey: 'datasetId' });
    };
    
    return Dataset;
  };