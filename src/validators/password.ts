import bcrypt from 'bcrypt';

export const comparePassword = (password: string, hashedPassword: string): boolean => {
    if (!password || !hashedPassword) {
        return false;
    }
    return bcrypt.compareSync(password, hashedPassword);
};

export const isValidPassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
};
