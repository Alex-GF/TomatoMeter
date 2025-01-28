import axios, { AxiosRequestConfig, Method } from 'axios';

async function makeRequest() {
  let config: AxiosRequestConfig = {
    method: 'delete' as Method,
    maxBodyLength: Infinity,
    url: `http://localhost:4242/api/admin/projects/default/features/test`,
    headers: {
      Authorization: `*:*.e0fe9eccbbb170dd18a787653b7af2dd38a75ee16ced1b0fc99d58b5`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    },
  };

  const response = await axios.request(config);

  console.log(response);
}

makeRequest();
