function model(sequelize, DataTypes){
    const attributes = {
        email: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        passwordHash: { type: DataTypes.STRING, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        firstName: { type: DataTypes.STRING, allowNull: false },
        lastName: { type: DataTypes.STRING, allowNull: false },
        acceptTerms: { type: DataTypes.BOOLEAN },
        role: { type: DataTypes.STRING, allowNull: false },
        verificationToken: { type: DataTypes.STRING },
        verified: { type: DataTypes.DATE },
        resetToken: { type: DataTypes.STRING },
        resetTokenExpires: { type: DataTypes.DATE },
        passwordReset: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        updated: { type: DataTypes.DATE },
        isVerified: {
            type: DataTypes.VIRTUAL,
            get() { return !!(this.verified || this.passwordReset); }
        }
    }

    const options = {
        // Desabilitar timestampo por defecto
        timestamps: false, 
        defaultScope: {
          // excluir clave hash por default
          attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
          // Incluir hash con este atributo
          withHash: { attributes: {}, }
        }        
      };
    
      const _model = sequelize.define('account', attributes, options);
      _model.associate = function (models) {
        // hasMay: un usuario puede tiene todos los datos de tokenRefresh
        models.account.hasMany(models.refreshToken, { onDelete: 'CASCADE' });
        //models.refreshToken.belongsTo(models.account);
        //models.account.belongsTo(models.userForge, { foreignKey: { name: 'userForgeId', allowNull: true } });      
      }
    
      return _model;

}

module.exports= model
