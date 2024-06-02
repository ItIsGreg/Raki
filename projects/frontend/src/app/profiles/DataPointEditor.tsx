"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  explanation: z.string(),
  synonyms: z.array(z.string()),
  dimension: z.string(),
  unit: z.string(),
  valueset: z.array(z.string()),
});

export function DataPointEditor() {
  // 1. Define your form.
  const [synonyms, setSynonyms] = useState<string[]>(["synonym1", "synonym2"]);
  const [valueset, setValueset] = useState<string[]>([]);
  const [currentSynonym, setCurrentSynonym] = useState<string>("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      explanation: "",
      synonyms: [],
      dimension: "",
      unit: "",
      valueset: [],
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Datapoint</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <Card>
                  <FormItem>
                    <CardHeader>
                      <CardTitle>Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the data point
                      </FormDescription>
                      <FormMessage />
                    </CardContent>
                  </FormItem>
                </Card>
              )}
            />
            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <Card>
                  <FormItem>
                    <CardHeader>
                      <CardTitle>Explanation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormControl>
                        <Input
                          placeholder="This datapoint represents..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short explanation for the data point. You do not need
                        to provide one, but it might improve the understanding
                        of the data point.
                      </FormDescription>
                      <FormMessage />
                    </CardContent>
                  </FormItem>
                </Card>
              )}
            />
            <FormField
              control={form.control}
              name="synonyms"
              render={({ field }) => (
                <Card>
                  <FormItem>
                    <CardHeader>
                      <CardTitle>Synonyms</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* <FormControl> */}
                      <Card>
                        <CardContent>
                          <div className="flex flex-row gap-2 p-2">
                            {synonyms.map((synonym, index) => {
                              return <Badge key={index}>{synonym}</Badge>;
                            })}
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-row gap-1">
                          <Input placeholder="synonym" onChange={} />
                          <Button
                            onClick={() => {
                              setSynonyms([...synonyms, "synonym"]);
                            }}
                          >
                            Add
                          </Button>
                        </CardFooter>
                      </Card>
                      {/* </FormControl> */}
                      <FormDescription>
                        Create a list of synonyms for the data point. E.g.
                        abbreviations or alternative names.
                      </FormDescription>
                      <FormMessage />
                    </CardContent>
                  </FormItem>
                </Card>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default DataPointEditor;
