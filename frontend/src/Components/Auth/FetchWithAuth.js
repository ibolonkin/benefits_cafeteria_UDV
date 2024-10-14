import { refreshToken } from '../../auth';

export const fetchWithAuth = async (url, options = {}) => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const authOptions = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    let response = await fetch(url, authOptions);

    if (response.status === 401) {
      const tokenResponse = await refreshToken();

      if (tokenResponse.accessToken) {
        localStorage.setItem('accessToken', tokenResponse.accessToken);
        authOptions.headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;
        response = await fetch(url, authOptions);
      }
    }

    if (!response.ok) {
      throw new Error('Ошибка запроса');
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default fetchWithAuth;
