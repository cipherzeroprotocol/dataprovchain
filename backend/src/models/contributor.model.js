/**
 * Contributor model
 */
module.exports = (sequelize, DataTypes) => {
    const Contributor = sequelize.define('Contributor', {
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
      address: {
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
      name: {
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
          fields: ['address']
        },
        {
          unique: true,
          fields: ['datasetId', 'address']
        }
      ]
    });
    
    Contributor.associate = function(models) {
      Contributor.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      Contributor.belongsTo(models.User, { foreignKey: 'address', targetKey: 'walletAddress', as: 'user' });
    };
    
    return Contributor;
  };