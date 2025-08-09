"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Link from "next/link"; // Import Link
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert(`Submitting email: ${email}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6">
            Supercharge Your Productivity with Stella
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your friendly daily task bot, designed to keep you organized and
            motivated.
          </p>
          <Button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <Card className="w-full max-w-md shadow-xl rounded-lg">
          <CardHeader className="py-6">
            <CardTitle className="text-2xl font-bold text-center">
              Stay Updated with Stella!
            </CardTitle>
            <CardDescription className="text-gray-500 text-center">
              Subscribe to our newsletter for the latest updates and tips.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-left text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <Button className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
                Subscribe
              </Button>
            </form>
          </CardContent>
        </Card>
        <section id="features" className="mt-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature Cards (Example) */}
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Daily Reminders</h3>
              <p className="text-gray-600">
                Get personalized reminders to keep you on track.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Task Management</h3>
              <p className="text-gray-600">
                Easily create, update, and prioritize your tasks.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                Discord Integration
              </h3>
              <p className="text-gray-600">
                Manage your tasks directly from Discord.
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">
                Customizable Settings
              </h3>
              <p className="text-gray-600">
                Tailor Stella to fit your unique workflow.
              </p>
            </div>
          </div>
        </section>

        <section id="pricing" className="mt-16">
          <h2 className="text-3xl font-semibold mb-8 text-center">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pricing Tiers (Example) */}
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Free</h3>
              <p className="text-gray-600 mb-4">
                Basic features for getting started.
              </p>
              <p className="text-4xl font-bold text-indigo-700">$0</p>
              <Button className="mt-4 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75">
                Get Started
              </Button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md border-2 border-indigo-500">
              <h3 className="text-2xl font-semibold mb-4">Pro</h3>
              <p className="text-gray-600 mb-4">
                Advanced features for power users.
              </p>
              <p className="text-4xl font-bold text-indigo-700">$9.99</p>
              <Button className="mt-4 bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
                Upgrade Now
              </Button>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
              <p className="text-gray-600 mb-4">
                Custom solutions for large teams.
              </p>
              <p className="text-4xl font-bold text-indigo-700">Contact Us</p>
              <Button className="mt-4 bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75">
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Contact Section */}
      <section id="contact" className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-8">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            Have questions? We'd love to hear from you!
          </p>
          <Button className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75">
            Contact Support
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
