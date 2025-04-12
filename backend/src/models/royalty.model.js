/**
 * Royalty model
 */
module.exports = (sequelize, DataTypes) => {
    const Royalty = sequelize.define('Royalty', {
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
      contributorAddress: {
        type: DataTypes.STRING,
        allowNull: false
      },
      share: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          min: 0,
          max: 100
        }
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
      },
      lastCalculated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['datasetId']
        },
        {
          fields: ['contributorAddress']
        },
        {
          unique: true,
          fields: ['datasetId', 'contributorAddress']
        }
      ]
    });
    
    Royalty.associate = function(models) {
      Royalty.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      Royalty.belongsTo(models.User, { foreignKey: 'contributorAddress', targetKey: 'walletAddress', as: 'contributor' });
    };
    
    return Royalty;
  };