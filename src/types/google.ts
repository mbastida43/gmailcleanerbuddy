import { google } from 'googleapis';

// Deriva os tipos diretamente da instância de OAuth2 exposta pelo googleapis
// (em vez de importar `google-auth-library` separadamente), porque o
// googleapis vendoriza sua própria cópia da lib e os tipos não são
// estruturalmente intercambiáveis com um pacote `google-auth-library` externo.
export type OAuth2Client = InstanceType<typeof google.auth.OAuth2>;

export async function exchangeCodeForTokens(client: OAuth2Client, code: string) {
  const { tokens } = await client.getToken(code);
  return tokens;
}

export type OAuthTokens = Awaited<ReturnType<typeof exchangeCodeForTokens>>;
