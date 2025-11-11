// import axios from "axios";
// import { Request, Response } from "express";

// // Define your microservices
// const services = [
//   { name: "Auth Service", url: "http://localhost:6001/docs-json" },
// ];

// // Function to fetch all swagger JSONs
// async function fetchSwaggerDocs() {
//   const results = [];
//   for (const svc of services) {
//     try {
//       const { data } = await axios.get(svc.url);
//       results.push({ name: svc.name, spec: data });
//     } catch (err) {
//       console.log(`⚠️  Could not load ${svc.name}: ${err}`);
//     }
//   }
//   return results;
// }

// export const swaggerAggregator = async (req: Request, res: Response) => {
//   const specs = await fetchSwaggerDocs();

//   const html = `
//     <html>
//       <head>
//         <title>API Documentation</title>
//         <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
//       </head>
//       <body>
//         <h1 style="text-align:center">Eshop API Documentation</h1>
//         ${specs
//           .map(
//             (svc) => `
//             <div style="margin-bottom:50px;">
//               <h2>${svc.name}</h2>
//               <iframe srcdoc='
//                 <html>
//                 <head>
//                   <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
//                   <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
//                 </head>
//                 <body>
//                   <div id="swagger"></div>
//                   <script>
//                     SwaggerUIBundle({ spec: ${JSON.stringify(svc.spec)} });
//                   </script>
//                 </body>
//                 </html>'
//                 style="width:100%; height:600px; border:1px solid #ccc;">
//               </iframe>
//             </div>
//           `
//           )
//           .join("")}
//       </body>
//     </html>
//   `;

//   res.send(html);
// };

import swaggerUi from "swagger-ui-express";
import swaggerCombine from "swagger-combine";
import { Express } from "express";

export async function setupSwaggerGateway(app: Express) {
  // Define Swagger sources
  const config = {
    swagger: "2.0",
    info: {
      title: "Eshop Unified API",
      version: "1.0.0",
      description: "Combined API documentation for all microservices",
    },
    apis: [
      {
        url: "http://localhost:6001/docs-json",
        name: "Auth Service",
      },
    ],
  };

  // Combine them into a single OpenAPI spec
  const combinedSpec = await swaggerCombine(config);

  // Serve it at /docs — styled automatically by Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(combinedSpec));
}
