import deckyPlugin from "@decky/rollup";
import url from '@rollup/plugin-url';

export default deckyPlugin({
  plugins: [
    url({
      include: ['**/pdfjs-dist/build/pdf.worker.min.mjs'],
      limit: 0,
      publicPath: `http://127.0.0.1:1337/plugins/Example%20Plugin/dist/`,
      fileName: 'pdf.worker.min.mjs'
    }),
  ],
})