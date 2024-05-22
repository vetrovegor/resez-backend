export const extractFileName = (questionPicture: string): string => {
    return questionPicture
        ? questionPicture.split(`${process.env.API_URL}/`)[1]
        : null;
};
