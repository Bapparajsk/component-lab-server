export const each = async (len: number, callback: () => Promise<boolean>) => {
    while (len--) {
        const result = await callback();
        if (result) break;
    }
};
