'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin } from 'lucide-react'

export function ContactSection() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/google-sheets/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setTimeout(() => {
          setSubmitted(false)
          setFormData({ fullName: '', email: '', phone: '', company: '', message: '' })
        }, 3000)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl font-bold mb-4">Get in touch</h2>
        <p className="text-xl text-muted-foreground">We reply within 24 hours.</p>
      </div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="p-8 rounded-xl border border-border bg-card text-center hover:border-primary/50 transition-colors">
          <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Email</h3>
          <a href="mailto:hello@outreachai.com" className="text-muted-foreground hover:text-primary transition-colors">
            hello@outreachai.com
          </a>
        </div>

        <div className="p-8 rounded-xl border border-border bg-card text-center hover:border-primary/50 transition-colors">
          <Phone className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Phone/WhatsApp</h3>
          <a href="https://wa.me/234" className="text-muted-foreground hover:text-primary transition-colors">
            Coming soon
          </a>
        </div>

        <div className="p-8 rounded-xl border border-border bg-card text-center hover:border-primary/50 transition-colors">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Office</h3>
          <p className="text-muted-foreground">
            Lagos, Nigeria
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="max-w-2xl mx-auto p-12 rounded-2xl border border-border bg-card">
        <h3 className="text-2xl font-bold mb-2">Send us a message</h3>
        <p className="text-muted-foreground mb-8">Required: name, email, phone, message.</p>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl">✓</div>
            <h4 className="text-xl font-bold">Message received</h4>
            <p className="text-muted-foreground">We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  required
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company (optional)</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                required
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none"
                rows={6}
              />
            </div>

            <div className="flex gap-4">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 rounded border-border"
              />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I accept the Terms and Privacy.
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
