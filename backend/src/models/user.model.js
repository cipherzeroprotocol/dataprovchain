/**
 * User model
 */
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      walletAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
      },
      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      apiKey: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      }
    }, {
      timestamps: true,
      paranoid: true, // Soft delete
      indexes: [
        {
          unique: true,
          fields: ['walletAddress']
        },
        {
          unique: true,
          fields: ['username']
        },
        {
          fields: ['email']
        }
      ]
    });
    
    User.associate = function(models) {
      User.hasMany(models.Dataset, { foreignKey: 'creator', as: 'datasets' });
      User.hasMany(models.ProvenanceRecord, { foreignKey: 'performedBy', as: 'provenanceRecords' });
      User.hasMany(models.Usage, { foreignKey: 'usedBy', as: 'usageRecords' });
      User.hasMany(models.Listing, { foreignKey: 'seller', as: 'listings' });
      User.hasMany(models.Purchase, { foreignKey: 'buyer', as: 'purchases' });
    };
    
    return User;
  };