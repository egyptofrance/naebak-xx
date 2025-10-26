import { Metadata } from "next";
import { z } from "zod";
import { SignUp } from "./Signup";

const SearchParamsSchema = z.object({
  next: z.string().optional(),
  nextActionType: z.string().optional(),
});

export const metadata: Metadata = {
  title: "Sign Up | نائبك",
  description:
    "Create an account to get started with نائبك",
};

export default async function SignUpPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<unknown>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { next, nextActionType } = SearchParamsSchema.parse(searchParams);
  return <SignUp next={next} nextActionType={nextActionType} locale={params.locale} />;
}
