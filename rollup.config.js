import deckyPlugin from "@decky/rollup";
import url from '@rollup/plugin-url';
import copy from 'rollup-plugin-copy';

export default deckyPlugin({
  plugins: [
    url({
      include: ['**/pdfjs-dist/build/pdf.worker.min.mjs'],
      limit: 0,
      publicPath: `http://127.0.0.1:1337/plugins/RetroDeck%20Menu/dist/`,
      fileName: 'pdf.worker.min.mjs'
    }),
    copy({
      targets: [
        {
          src: 'assets/retrodeck-icons/*',
          dest: 'dist/retrodeck-icons'
        }
      ]
    })
  ],
})