const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class FilecoinDeal extends Model {
    static associate(models) {
      // A FilecoinDeal belongs to a Dataset
      FilecoinDeal.belongsTo(models.Dataset, {
        foreignKey: 'datasetId',
        as: 'dataset'
      });
      
      // A FilecoinDeal is made by a User (provider)
      FilecoinDeal.belongsTo(models.User, {
        foreignKey: 'providerId',
        as: 'provider'
      });
    }
  }

  FilecoinDeal.init({
    dealId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The Filecoin deal ID'
    },
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Datasets',
        key: 'id'
      }
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    cid: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Content ID (CID) of the stored data'
    },
    miner: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Filecoin miner address'
    },
    size: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Size of the data in bytes'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the deal starts'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration of the deal in epochs'
    },
    price: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Price per epoch in attoFIL'
    },
    status: {
      type: DataTypes.ENUM('proposed', 'active', 'expired', 'error'),
      allowNull: false,
      defaultValue: 'proposed',
      comment: 'Current status of the deal'
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Filecoin network (mainnet, calibrationnet, etc.)'
    },
    transactionHash: {
      type: DataTypes.STRING,
      comment: 'Transaction hash for the deal'
    },
    pieceCid: {
      type: DataTypes.STRING,
      comment: 'Piece CID for the deal'
    },
    verifiedDeal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a verified deal'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FilecoinDeal',
    tableName: 'filecoin_deals',
    timestamps: true
  });

  return FilecoinDeal;
};
