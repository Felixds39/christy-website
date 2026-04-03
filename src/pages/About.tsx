import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import profilePhoto from "@/assets/profile-photo.jpg";

const About = () => (
  <Layout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 md:flex-row">
          <motion.img
            src={profilePhoto}
            alt="Dr. Gincy Susan George"
            className="h-80 w-80 rounded-2xl object-cover shadow-xl"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.div
            className="max-w-2xl"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="font-display text-4xl font-bold">About <span className="text-gradient">Dr. Gincy Susan George</span></h1>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Dr. Gincy Susan George is an accomplished academic leader, educator, and mental health specialist
              with advanced expertise in Psychiatric Mental Health Nursing. She holds a PhD in Psychiatric Mental
              Health Nursing and an MSc in Mental Health Nursing, combining academic excellence with clinical
              expertise and a passion for empowerment.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              With years of experience in nursing education and mentorship, Dr. Gincy is committed to helping
              individuals build confidence, resilience, and strong communication skills.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                "Psychiatric Mental Health Nursing",
                "Academic Leadership",
                "Communication & Public Speaking",
                "Youth & Professional Empowerment",
                "Confidence Building",
                "Emotional Intelligence",
              ].map((e) => (
                <div key={e} className="rounded-lg border bg-muted/40 px-4 py-2 text-sm font-medium">{e}</div>
              ))}
            </div>
            <blockquote className="mt-8 border-l-4 border-primary pl-4 italic text-muted-foreground">
              "To empower voices, strengthen confidence, and develop leaders who communicate with clarity,
              compassion, and purpose."
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  </Layout>
);

export default About;
