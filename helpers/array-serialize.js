export default function arrSerialize(arr) {
  if (typeof arr !== 'object') {
    return arr;
  }

  let value = '';
  for (const elem of arr) {
    const str = `
    name: ${elem.name},
    resolution: ${elem.resolution},
    resoluton ID: ${elem.id},
    registration date: ${new Date(elem.regTime)}
    `;
    value += str;
  }

  return value;
}
