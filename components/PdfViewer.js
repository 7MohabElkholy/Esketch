import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system/legacy";

export default function PdfViewer({ pdfUrl }) {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const localPath = FileSystem.cacheDirectory + "temp.pdf";

        // Download PDF
        const { uri } = await FileSystem.downloadAsync(pdfUrl, localPath);
        console.log("Downloaded file:", uri);

        // Convert to base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const dataUrl = `data:application/pdf;base64,${base64}`;

        // Build HTML with PDF.js
        const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { margin: 0; padding: 0; background: #fff; }
      #viewer { display: flex; flex-direction: column; align-items: center; }
      canvas { margin: 10px 0; max-width: 95%; }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"></script>
  </head>
  <body>
    <div id="viewer"></div>
    <script>
      (function() {
        const pdfData = atob("${base64}");
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        loadingTask.promise.then(function(pdf) {
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
              const scale = 1.2;
              const viewport = page.getViewport({ scale });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              document.getElementById('viewer').appendChild(canvas);

              const renderContext = { canvasContext: context, viewport: viewport };
              page.render(renderContext);
            });
          }
        }).catch(function(err) {
          document.body.innerHTML = "<h3 style='color:red'>Failed to load PDF: " + err.message + "</h3>";
        });
      })();
    </script>
  </body>
</html>
        `;

        if (isMounted) setHtmlContent(html);
      } catch (err) {
        console.error("Error downloading PDF:", err);
        if (isMounted) {
          setHtmlContent(`
<html><body><h3 style="color:red">Error: ${err.message}</h3></body></html>
`);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl]);

  if (!htmlContent) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={{ html: htmlContent }}
      style={{ flex: 1 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
}
