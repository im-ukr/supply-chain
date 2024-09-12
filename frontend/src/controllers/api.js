export const getAPI = async (url, filter) => {
  let reqURL = url;
  if (filter && filter.length > 0) {
    reqURL += `?filter=${encodeURIComponent(filter)}`;
  }

  const response = await fetch('/api' + reqURL, {
    headers: {
      'X-Access-Token': 'REPLACE_WITH_ACCESS_TOKEN'
    }
  });
  return response.json();
};

export const parseId = fqName => {
  return fqName.split('#')[1];
};

export const parseType = fqName => {
  const split = fqName.split('#')[0].split('.');
  return split[split.length - 1];
};

export const parseDate = timestamp => {
  return new Date(timestamp).toLocaleDateString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
