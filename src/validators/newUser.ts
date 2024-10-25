import {isEmail} from "./email";
import {isValidPassword} from "./password";

interface NewUser {
    name: string | null | undefined;
    displayName: string | null | undefined;
    email: string | null | undefined;
    password: string | null | undefined;
}

export const validData = ({ name, displayName, email, password }: NewUser): [string | null, boolean] => {
    if (!name || !displayName || !email || !password) {
        return ["Name, displayName, email and password are required", false];
    }

    if (name.length < 3) {
        return ["Name must be at least 3 characters", false];
    }

    if (displayName.length < 3 || displayName.charAt(0) !== "@") {
        return ["Display name must be at least 3 characters and start with @", false];
    }

    if (!isEmail(email)) {
        return ["Email is invalid", false];
    }

    if (!isValidPassword(password)) {
        return ["Password is invalid", false];
    }

    return [null, true];
};
