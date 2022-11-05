import simpleWebpConverter from 'simple-webp-converter';

export default function viteWebP() {
  return {
    name: 'viteWebP',
    apply: 'build',
    enforce: 'post',

    writeBundle() {
      simpleWebpConverter();
    },
  };
}
