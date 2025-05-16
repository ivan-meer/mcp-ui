import React from 'react';
import type { Route } from "./+types/task";
import { Graph } from '../graph/graph';


export function meta({}: Route.MetaArgs) {
    return [
      { title: "Order Uber" },
      { name: "description", content: "Order Uber!" },
    ];
  }
  
  export const loader = async ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const host = url.host;
    const pathname = url.pathname;
  
    return { url: request.url, host, pathname };
  };

  export default function Uber({ loaderData }: Route.ComponentProps) {
    return <Graph />;
  }