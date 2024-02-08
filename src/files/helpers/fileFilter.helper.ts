export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  // console.log({ file });
  if (!file) {
    return callback(new Error('El archivo está vacío'), false); // * El segundo argumento indica false cuando SÍ hay error
  }
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'jpeg'];
  if (validExtensions.includes(fileExtension)) {
    callback(null, true); // * El segundo argumento indica true cuando NO hay error
  }
  callback(null, false); // *Ocurrió un error
};
