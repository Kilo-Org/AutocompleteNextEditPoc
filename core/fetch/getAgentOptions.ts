import { RequestOptions } from "../index.js";
import { CertsCache, getCertificateContent } from "./certs.js";

interface AgentOptions {
  ca: string[];
  rejectUnauthorized?: boolean;
  timeout: number;
  sessionTimeout: number;
  keepAlive: boolean;
  keepAliveMsecs: number;
  cert?: string;
  key?: string;
  passphrase?: string;
}

/**
 * Prepares agent options based on request options and certificates
 */
export async function getAgentOptions(
  requestOptions?: RequestOptions,
): Promise<AgentOptions> {
  const TIMEOUT = 7200; // 7200 seconds = 2 hours
  const timeout = (requestOptions?.timeout ?? TIMEOUT) * 1000; // measured in ms

  const certsCache = CertsCache.getInstance();
  const ca = await certsCache.getCa(requestOptions?.caBundlePath);

  const agentOptions: AgentOptions = {
    ca,
    rejectUnauthorized: requestOptions?.verifySsl,
    timeout,
    sessionTimeout: timeout,
    keepAlive: true,
    keepAliveMsecs: timeout,
  };

  // Handle ClientCertificateOptions
  if (requestOptions?.clientCertificate) {
    const { cert, key, passphrase } = requestOptions.clientCertificate;

    agentOptions.cert = getCertificateContent(cert);
    agentOptions.key = getCertificateContent(key);

    if (requestOptions.clientCertificate.passphrase) {
      agentOptions.passphrase = passphrase;
    }
  }

  if (process.env.VERBOSE_FETCH) {
    console.log(`Fetch agent options:`);
    console.log(
      `\tTimeout (sessionTimeout/keepAliveMsecs): ${agentOptions.timeout}`,
    );
    console.log(`\tTotal CA certs: ${ca.length}`);
    console.log(`\tGlobal/Root CA certs: ${certsCache.fixedCa.length}`);
    console.log(`\tCustom CA certs: ${ca.length - certsCache.fixedCa.length}`);
    console.log(
      `\tClient certificate: ${requestOptions?.clientCertificate ? "Yes" : "No"}`,
    );
    console.log(
      `\trejectUnauthorized/verifySsl: ${agentOptions.rejectUnauthorized ?? "not set (defaults to true)"}`,
    );
  }

  return agentOptions;
}
