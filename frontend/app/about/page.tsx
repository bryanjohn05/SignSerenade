"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Languages, BookIcon as BookReader, Brain, Lightbulb, Users, Globe, Heart, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: <Languages className="w-10 h-10" />,
      title: "Real-Time Translation",
      description: "Convert sign language gestures into spoken and written words, breaking barriers in communication.",
    },
    {
      icon: <BookReader className="w-10 h-10" />,
      title: "Interactive Learning",
      description:
        "A learning platform for sign language that offers tutorials, quizzes, and validation of user-performed actions.",
    },
    {
      icon: <Brain className="w-10 h-10" />,
      title: "Powered by AI",
      description:
        "Utilizing AI to recognize complex hand gestures with precision and efficiency using Mediapipe and YOLO.",
    },
  ]

  const stats = [
    { value: "500,000+", label: "Deaf Americans who use ASL" },
    { value: "28", label: "Million Americans with hearing loss" },
    { value: "70", label: "Countries with their own sign languages" },
    { value: "98%", label: "Accuracy of our sign detection" },
  ]

  const timeline = [
    {
      year: "August 2024",
      title: "Project Inception",
      description: "SignSerenade began as an application based project focused on making communication more accessible.",
    },
    {
      year: "December 2024",
      title: "Technology Development",
      description: "Integration of MediaPipe and custom ML models to accurately detect and translate sign language.",
    },
    {
      year: "January 2025",
      title: "Prototype Presentation",
      description: "First prototype presented at a St Joseph Engineering College, receiving positive feedback from the community.",
    },
    {
      year: "April 2025",
      title: "Final Product",
      description: "Completion of the final product, showcasing real-time translation and interactive learning features.",
    },
    {
      year: "Future Plans",
      title: "Expanding Horizons",
      description: "Plans to support multiple sign languages and develop mobile applications for wider accessibility.",
    },
  ]

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1128] to-[#1c2e4a]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-900/30 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a1128] to-transparent"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">About SignSerenade</h1>
            <div className="w-24 h-1 bg-[#c7d7f5] mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto">
              Breaking barriers in communication through innovative sign language technology
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4 bg-gray-200 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">Our Mission</h2>
              <div className="w-16 h-1 bg-[#c7d7f5] mb-6"></div>
              <p className="text-blue-900 mb-6 text-lg">
                SignSerenade is dedicated to bridging the communication gap between the deaf and hearing communities
                through cutting-edge technology. We believe that language should never be a barrier to human connection.
              </p>
              <p className="text-blue-900 mb-6 text-lg">
                By leveraging artificial intelligence and machine learning, we've created a platform that not only
                translates sign language in real-time but also provides an interactive learning environment for those
                wanting to learn sign language.
              </p>
              <div className="flex items-center text-black">
                <Lightbulb className="text-yellow-500 mr-2" />
                <span className="font-medium">Empowering communication for everyone, everywhere.</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-2xl"
            >
              <video
              src="/about.mp4"
              playsInline
              autoPlay
              muted
              loop
              className="w-full h-auto object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 ">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Technology</h2>
            <div className="w-16 h-1 bg-[#c7d7f5] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powered by advanced AI and computer vision, SignSerenade offers a comprehensive suite of tools for sign
              language translation and learning.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:bg-white/15 border border-white/10"
              >
                <div className="text-[#c7d7f5] mb-6 p-4 bg-blue-900/30 rounded-full inline-block">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 px-4 bg-gray-200 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">Sign Language Impact</h2>
            <div className="w-16 h-1 bg-[#c7d7f5] mx-auto mb-6"></div>
            <p className="text-xl text-blue-900 max-w-3xl mx-auto">
              American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as
              spoken languages.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 p-6 rounded-xl text-center border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <p className="text-4xl font-bold text-[#16243f] mb-2">{stat.value}</p>
                <p className="text-blue-900">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
      <section className="py-16 px-4 bg-gray-200 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <img
                src="/asl.jpg?key=ogbu0"
                alt="American Sign Language Alphabet"
                className="w-full h-auto object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">About American Sign Language</h2>
              <div className="w-16 h-1 bg-[#c7d7f5] mb-6"></div>
              <p className="text-blue-900 mb-6 text-lg">
                American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as
                spoken languages, with grammar that differs from English. It is the primary language of many North
                Americans who are deaf and hard of hearing.
              </p>
              <p className="text-blue-900 mb-6 text-lg">
                ASL is expressed by movements of the hands and face. It is the primary language of many North Americans
                who are deaf and is one of several communication options used by people who are deaf or hard-of-hearing.
              </p>
              <div className="flex flex-col space-y-4 text-blue-900">
                <div className="flex items-start">
                  <Globe className="mr-3 text-[#091120] mt-1 flex-shrink-0" />
                  <p>ASL is used in the United States and most of Canada</p>
                </div>
                <div className="flex items-start">
                  <Users className="mr-3 text-[#091120] mt-1 flex-shrink-0" />
                  <p>Estimated 250,000-500,000 people use ASL as their primary language</p>
                </div>
                <div className="flex items-start">
                  <Heart className="mr-3 text-[#091120] mt-1 flex-shrink-0" />
                  <p>ASL is a crucial part of Deaf culture and community identity</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Journey</h2>
            <div className="w-16 h-1 bg-[#c7d7f5] mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              The evolution of SignSerenade from concept to reality
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-[#c7d7f5]/30"></div>

            {/* Timeline items */}
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative mb-12 flex ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className="flex-1"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/4">
                  <div className="w-6 h-6 rounded-full bg-[#c7d7f5] border-4 border-blue-900"></div>
                </div>
                <div className="flex-1 md:px-8">
                  <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                    <span className="text-[#c7d7f5] font-bold">{item.year}</span>
                    <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                    <p className="text-gray-300">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ASL Information Section */}
      {/* <section className="py-16 px-4 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-2xl order-2 md:order-1"
            >
              <img
                src="/placeholder.svg?key=ogbu0"
                alt="American Sign Language Alphabet"
                className="w-full h-auto object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">About American Sign Language</h2>
              <div className="w-16 h-1 bg-[#c7d7f5] mb-6"></div>
              <p className="text-gray-300 mb-6 text-lg">
                American Sign Language (ASL) is a complete, natural language that has the same linguistic properties as
                spoken languages, with grammar that differs from English. It is the primary language of many North
                Americans who are deaf and hard of hearing.
              </p>
              <p className="text-gray-300 mb-6 text-lg">
                ASL is expressed by movements of the hands and face. It is the primary language of many North Americans
                who are deaf and is one of several communication options used by people who are deaf or hard-of-hearing.
              </p>
              <div className="flex flex-col space-y-4 text-gray-300">
                <div className="flex items-start">
                  <Globe className="mr-3 text-[#c7d7f5] mt-1 flex-shrink-0" />
                  <p>ASL is used in the United States and most of Canada</p>
                </div>
                <div className="flex items-start">
                  <Users className="mr-3 text-[#c7d7f5] mt-1 flex-shrink-0" />
                  <p>Estimated 250,000-500,000 people use ASL as their primary language</p>
                </div>
                <div className="flex items-start">
                  <Heart className="mr-3 text-[#c7d7f5] mt-1 flex-shrink-0" />
                  <p>ASL is a crucial part of Deaf culture and community identity</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-800/50 to-purple-800/50">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to Experience SignSerenade?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Start translating and learning sign language today with our cutting-edge platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/translate"
                className="bg-[#c7d7f5] hover:bg-white text-blue-900 font-bold py-3 px-8 rounded-full flex items-center transition-all duration-300"
              >
                Start Translating <ArrowRight className="ml-2" />
              </Link>
              <Link
                href="/learn"
                className="bg-transparent hover:bg-white/10 text-white border border-white font-bold py-3 px-8 rounded-full flex items-center transition-all duration-300"
              >
                Learn Sign Language <ArrowRight className="ml-2" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
