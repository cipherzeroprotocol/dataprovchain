/**
 * Usage model
 */
module.exports = (sequelize, DataTypes) => {
    const Usage = sequelize.define('Usage', {
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
      modelId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      usageType: {
        type: DataTypes.ENUM('training', 'validation', 'testing', 'inference'),
        allowNull: false
      },
      usedBy: {
        type: DataTypes.STRING,
        allowNull: false
      },
      impactScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 100
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
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
          fields: ['modelId']
        },
        {
          fields: ['usageType']
        },
        {
          fields: ['usedBy']
        }
      ]
    });
    
    Usage.associate = function(models) {
      Usage.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
      Usage.belongsTo(models.User, { foreignKey: 'usedBy', targetKey: 'walletAddress', as: 'user' });
    };
    
    return Usage;
  };