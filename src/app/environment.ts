const ip = location.host.split(':')[0];
const port = location.host.split(':')[1];
console.log('Ip: ' + port);

export const environment = {
  production: true,
  ip: ip,
  apiUrl: `http://${ip}:8090`,

  apiUrlDomains: `http://${ip}:3571`,
  // apiUrl: `http://192.168.100.228:3571`,

  grafanaUrl: `http://${ip}:3000`,
  // apiUrl: `http://192.168.100.228:3571`,
};

if (port == '4215') {
  environment.apiUrl = `http://192.168.100.228:8090`;
}

console.log(environment.apiUrl);
console.log(location.host);
