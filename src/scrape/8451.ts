import { z } from "zod";
import { Job } from "../job";

const jobSchema = z.object({
  data: z.object({
    jobs: z.object({
      edges: z.array(
        z.object({
          node: z.object({
            url: z.string(),
            title: z.string(),
            id: z.string(),
            location: z.object({
              name: z.string(),
            }),
            departments: z.array(
              z.object({
                name: z.string(),
              }),
            ),
            offices: z.array(
              z.object({
                name: z.string(),
                location: z.string(),
              }),
            ),
          }),
        }),
      ),
    }),
  }),
});

export const scrape8451 = async (): Promise<Job[]> => {
  try {
    const res = await fetch(
      "https://www.8451.com/page-data/sq/d/1016912696.json",
    );
    const data = await res.json();
    const parsedData = jobSchema.parse(data);
    return parsedData.data.jobs.edges.map((edge) => ({
      id: edge.node.id,
      title: edge.node.title,
      url: edge.node.url,
      company: "84.51",
      location: edge.node.location.name,
      department: edge.node.departments.join(", "),
      office: edge.node.offices.join(", "),
    }));
  } catch (error) {
    console.error(error);
    throw error;
  }
};
