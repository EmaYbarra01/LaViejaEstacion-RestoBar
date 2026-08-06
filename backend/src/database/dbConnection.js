import dns from 'dns';
import { connect } from 'mongoose';
import { MONGODB_URI } from '../config.js';

if (MONGODB_URI.startsWith('mongodb+srv://')) {
  const dnsServers = (process.env.DNS_SERVERS || '1.1.1.1,8.8.8.8')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  dns.setServers(dnsServers);
  console.log(`🌐 DNS configurado para SRV: ${dnsServers.join(', ')}`);
}

connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then((resp) => console.log(`DB conectada en ${resp.connection.name}`))
  .catch((error) => console.log(error));