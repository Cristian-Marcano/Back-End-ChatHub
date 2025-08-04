export const getBaseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 4px solid #000000;
      border-radius: 4px;
      box-shadow: 8px 8px 0px 0px #000000;
      overflow: hidden;
    }
    .header {
      background-color: #000000;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .content {
      padding: 30px 20px;
      color: #1f2937;
      line-height: 1.6;
    }
    .code-box {
      background-color: #f3f4f6;
      border: 2px solid #000000;
      border-radius: 4px;
      padding: 15px;
      text-align: center;
      font-size: 32px;
      font-weight: 900;
      letter-spacing: 4px;
      margin: 20px 0;
    }
    .token-box {
      background-color: #f3f4f6;
      border: 2px solid #000000;
      border-radius: 4px;
      padding: 15px;
      text-align: center;
      font-size: 16px;
      font-family: monospace;
      font-weight: bold;
      word-break: break-all;
      margin: 20px 0;
    }
    .footer {
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      border-top: 2px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      Este es un correo automático de ChatHub. Por favor, no respondas a este mensaje.
    </div>
  </div>
</body>
</html>
`;

export const getVerifyEmailTemplate = (code: number) => {
  return getBaseTemplate(
    'Verifica tu correo',
    `
      <h2>¡Hola!</h2>
      <p>Gracias por unirte a ChatHub. Para completar tu registro, por favor ingresa el siguiente código de 6 dígitos en la aplicación:</p>
      <div class="code-box">${code}</div>
      <p>Este código expirará pronto. Si no has solicitado este registro, puedes ignorar este correo con seguridad.</p>
    `
  );
};

export const getForgotPasswordTemplate = (token: string) => {
  return getBaseTemplate(
    'Restablecer Contraseña',
    `
      <h2>Solicitud de cambio de contraseña</h2>
      <p>Hemos recibido una solicitud para cambiar tu contraseña en ChatHub. Copia el siguiente token de seguridad e ingrésalo en la aplicación junto con tu nueva contraseña:</p>
      <div class="token-box">${token}</div>
      <p>Si no fuiste tú quien solicitó este cambio, por favor ignora este correo. Tu cuenta sigue estando segura.</p>
    `
  );
};

export const getChangeEmailOldTemplate = (code: number) => {
  return getBaseTemplate(
    'Cambio de Correo - Verificación de Seguridad',
    `
      <h2>Protección de Cuenta</h2>
      <p>Has solicitado cambiar la dirección de correo electrónico asociada a tu cuenta. Para autorizar este cambio, utiliza el siguiente código:</p>
      <div class="code-box">${code}</div>
      <p><strong>IMPORTANTE:</strong> Si no solicitaste cambiar tu correo, alguien podría estar intentando acceder a tu cuenta. Cambia tu contraseña inmediatamente.</p>
    `
  );
};

export const getChangeEmailNewTemplate = (code: number) => {
  return getBaseTemplate(
    'Enlaza este correo a tu cuenta',
    `
      <h2>Casi listo</h2>
      <p>Para confirmar que esta dirección de correo te pertenece y enlazarla a tu cuenta de ChatHub, utiliza el siguiente código:</p>
      <div class="code-box">${code}</div>
    `
  );
};
