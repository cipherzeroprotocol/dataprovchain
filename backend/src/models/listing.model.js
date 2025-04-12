/**
 * Marketplace listing model
 */
module.exports = (sequelize, DataTypes) => {
    const Listing = sequelize.define('Listing', {
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
      onChainId: {
        type: DataTypes.STRING,
        allowNull: true
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
      seller: {
        type: DataTypes.STRING,
        allowNull: false
      },
      terms: {
        type: DataTypes.JSON,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'sold', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'active'
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
          fields: ['datasetId']
        },
        {
          fields: ['onChainId']
        },
        {
          fields: ['seller']
        },
        {
          fields: ['status']
        },
        {
          fields: ['licenseType']
        }
      ]
    });
    
    Listing.associate = function(models) {
      Listing.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      Listing.belongsTo(models.User, { foreignKey: 'seller', targetKey: 'walletAddress', as: 'sellerUser' });
      Listing.hasMany(models.Purchase, { foreignKey: 'listingId' });
    };
    
    return Listing;
  };