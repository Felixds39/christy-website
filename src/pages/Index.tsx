import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, BookOpen, Users, Heart } from "lucide-react";
import profilePhoto from "@/assets/profile-photo.jpg";

const features = [
  { icon: Mic, title: "Public Speaking", desc: "Empowering individuals to communicate with clarity, confidence, and purpose." },
  { icon: BookOpen, title: "Mental Health", desc: "Expert insights in Psychiatric Mental Health Nursing and emotional well-being." },
  { icon: Users, title: "Leadership", desc: "Building resilient leaders through mentorship, education, and community." },
  { icon: Heart, title: "Empowerment", desc: "Helping youth and professionals unlock their true potential." },
];

const Index = () => (
  <Layout>
    {/* Hero */}
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="container mx-auto flex flex-col items-center gap-12 px-4 md:flex-row">
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Empowering Voices.{" "}
            <span className="text-gradient">Inspiring Change.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Welcome to <strong>Speak_Up wid Chris</strong> — a platform by Dr. Gincy Susan George
            dedicated to leadership, mental health awareness, and the power of communication.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link to="/about">
              <Button size="lg" className="bg-brand-gradient text-primary-foreground">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img
            src={profilePhoto}
            alt="Dr. Gincy Susan George"
            className="h-72 w-72 rounded-2xl object-cover shadow-xl md:h-80 md:w-80"
          />
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="border-t bg-muted/30 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-display text-3xl font-bold">
          What We <span className="text-gradient">Stand For</span>
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="rounded-xl border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-display text-3xl font-bold">
          Ready to <span className="text-gradient">Speak Up</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Explore our blog for insights, check out upcoming events, or reach out to collaborate.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/blog">
            <Button variant="outline" size="lg">Read the Blog</Button>
          </Link>
          <Link to="/events">
            <Button variant="outline" size="lg">View Events</Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" className="bg-brand-gradient text-primary-foreground">
              Contact Us
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </Layout>
);

export default Index;
