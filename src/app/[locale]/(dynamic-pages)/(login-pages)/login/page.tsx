import { Metadata } from "next";
import { z } from "zod";
import { Login } from "./Login";

const SearchParamsSchema = z.object({
  next: z.string().optional(),
  nextActionType: z.string().optional(),
});

export const metadata: Metadata = {
  title: "Login | نائبك",
  description: "Login to your نائبك account",
};

export default async function LoginPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<unknown>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { next, nextActionType } = SearchParamsSchema.parse(searchParams);
  return <Login next={next} nextActionType={nextActionType} locale={params.locale} />;
}
