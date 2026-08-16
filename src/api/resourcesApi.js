import api from './axios';

export const fetchAllResources = async () => {
  const response = await api.get('/resources/all/');
  return response.data;
};

export const createPdfResource = async (objectName) => {
  const response = await api.post('/resources/files/', { object_name: objectName });
  return response.data;
};

export const uploadPdfToRailway = async ({ url, fields, file }) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload PDF to storage.');
  }
};

export const getPdfPresignedUrl = async (objectName) => {
  const encodedName = encodeURIComponent(objectName);
  const response = await api.get(`/resources/files/${encodedName}/`);
  return response.data.url;
};

export const createLink = async ({ title, link }) => {
  const response = await api.post('/resources/link/', { title, link });
  return response.data;
};

export const getLink = async (id) => {
  const response = await api.get(`/resources/link/${id}`);
  return response.data;
};

export const deletePdf = async (id) => {
  const response = await api.delete(`/resources/pdf/${id}/`);
  return response.data;
};

export const deleteLink = async (id) => {
  const response = await api.delete(`/resources/link/delete/${id}/`);
  return response.data;
};

export const normalizePinnedResources = (data) => {
  if (data?.Message) {
    return { pdfs: [], links: [] };
  }

  return {
    pdfs: Array.isArray(data?.pdfs) ? data.pdfs : [],
    links: Array.isArray(data?.links) ? data.links : [],
  };
};
