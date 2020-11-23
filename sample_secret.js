const SECRET_JWT = '<SECRET_JWT>';

class SecretsController {
    getSecret() {
        return SECRET_JWT;
    }
}

module.exports = SecretsController;