import qs from 'qs';

export function getPointFieldName() {
  const params = qs.parse(window.location.search.substring(1));
  return params.point;
}
