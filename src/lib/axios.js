import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://learn.codeit.kr/api/link-service',
});

export default instance;
