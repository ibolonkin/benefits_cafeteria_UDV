
export const login = async (credentials) => {
  try {
    const response = await fetch('http://localhost:8000/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Ошибка при логине');
    }


    return response

  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const registration = async (data) => {
  try {
    const response = await fetch('http://26.15.99.17:8000/v1/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log(await response.json());
      throw new Error('Ошибка при регистрации');
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
};


