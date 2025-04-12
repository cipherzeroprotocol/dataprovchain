/**
 * Tag model
 */
module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      timestamps: true,
      indexes: [
        {
          fields: ['datasetId']
        },
        {
          fields: ['name']
        },
        {
          unique: true,
          fields: ['datasetId', 'name']
        }
      ]
    });
    
    Tag.associate = function(models) {
      Tag.belongsTo(models.Dataset, { foreignKey: 'datasetId' });
    };
    
    return Tag;
  };