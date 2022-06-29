const { DataTypes } = require('sequelize');

/**
 * @function model
 * @param {*} sequelize
 * @description Modelo de usuario
 */
function model(sequelize) {
    //nombracion de variable atribututos para despues armar la table de la DB
    const attributes = {
        token: { type: DataTypes.STRING },
        expires: { type: DataTypes.DATE },
        created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        createdByIp: { type: DataTypes.STRING },
        revoked: { type: DataTypes.DATE },
        revokedByIp: { type: DataTypes.STRING },
        replacedByToken: { type: DataTypes.STRING },
        isExpired: {
            type: DataTypes.VIRTUAL,
            get() { return Date.now() >= this.expires; }
        },
        isActive: {
            type: DataTypes.VIRTUAL,
            get() { return !this.revoked && !this.isExpired; }
        }
    };

    const options = {
        // desabilitar  tiempo creacion
        timestamps: false
    };
    //creacion de la tabla de la base de datos
    const _model = sequelize.define('refreshToken', attributes, options);
    _model.associate = function (models) {
        //belong uno a uno, es decir, un token tiene un usuario 
        models.refreshToken.belongsTo(models.account);
      //models.account.belongsTo(models.userForge, { foreignKey: { name: 'userForgeId', allowNull: true } });      
    }
  
    return _model;
}
module.exports = model;