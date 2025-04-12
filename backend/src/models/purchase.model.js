/**
 * Purchase model
 */
module.exports = (sequelize, DataTypes) => {
    const Purchase = sequelize.define('Purchase', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      listingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Listings',
          key: 'id'
        }
      },
      datasetId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Datasets',
          key: 'id'
        }
      },
      buyer: {
        type: DataTypes.STRING,
        allowNull: false
      },
      price: {
        type: DataTypes.STRING,
        allowNull: false
      },
      licenseType: {
        type: DataTypes.ENUM('research', 'commercial', 'educational', 'personal'),
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      transactionHash: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['listingId']
        },
        {
          fields: ['datasetId']
        },
        {
          fields: ['buyer']
        }
      ]
    });
    
    Purchase.associate = function(models) {
      Purchase.belongsTo(models.Listing, { foreignKey: 'listingId' });
      Purchase.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      Purchase.belongsTo(models.User, { foreignKey: 'buyer', targetKey: 'walletAddress', as: 'buyerUser' });
      Purchase.hasOne(models.AccessGrant, { foreignKey: 'purchaseId' });
    };
    
    return Purchase;
  };