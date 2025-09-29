export const files = {
  jpg: {
    name: 'test.jpg',
    buffer: Buffer.from('fake-jpg-data'),
    mimetype: 'image/jpeg',
  },
  png: {
    name: 'test.png',
    buffer: Buffer.from('fake-png-data'),
    mimetype: 'image/png',
  },
  pdf: {
    name: 'test.pdf',
    buffer: Buffer.from('fake-pdf-data'),
    mimetype: 'application/pdf',
  },
  docx: {
    name: 'test.docx',
    buffer: Buffer.from('fake-docx-data'),
    mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
};

export const responses = {
  success: {
    success: true,
    data: expect.any(Object),
  },
  error: {
    success: false,
    data: expect.any(Object),
  },
};
