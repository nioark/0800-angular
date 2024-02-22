const ip = location.host.split(':')[0];

export const environment = {
  production: true,
  ip: ip,
  apiUrl: `http://${ip}:8090`,
  // apiUrl: `http://192.168.100.228:3571`,
};

console.log(location.host)
