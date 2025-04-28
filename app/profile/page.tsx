"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Droplet, Award, ShoppingBag, CreditCard, ChevronRight, Check, User } from "lucide-react";
import FloatingBubbles from "../../components/FloatingBubbles";
import { useHydration } from "@/contexts/hydration-context";
import AssessmentScreen from "./assessment-screen";

export default function ProfilePage() {
  const { state } = useHydration();
  const [showAssessment, setShowAssessment] = useState(false);

  if (showAssessment) {
    return <AssessmentScreen onBack={() => setShowAssessment(false)} />;
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-blue-400 to-blue-600 flex flex-col">
      <FloatingBubbles count={8} maxSize={25} />
      {/* Header */}
      <motion.div
        className="flex items-center p-4 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-light text-white ml-4">Your Profile</h1>
      </motion.div>
      {/* Main content */}
      <div className="flex-1 flex flex-col p-6 z-10 overflow-y-auto">
        {/* Hydration Assessment */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white text-lg font-medium">Hydration Assessment</h2>
                <p className="text-white/70 text-sm">
                  {state.userProfile ? "Your personalized hydration profile" : "Complete your assessment"}
                </p>
              </div>
            </div>
            <motion.button
              className="px-3 py-1 rounded-full bg-blue-500/40 text-white text-xs"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAssessment(true)}
            >
              {state.userProfile ? "Update" : "Complete"}
            </motion.button>
          </div>
          {state.userProfile && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/80">
              <div>Height: {state.userProfile.height}cm</div>
              <div>Weight: {state.userProfile.weight}kg</div>
              <div>Age: {state.userProfile.age}</div>
              <div>Activity: {state.userProfile.activityLevel}</div>
            </div>
          )}
        </motion.div>
        {/* Membership status */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-white text-lg mb-2">No plastic bottles for 12 days!</h2>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
              <div className="flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-white/80 text-sm">
              <p>Place dry bottles for 12 days!</p>
            </div>
          </div>
        </motion.div>
        {/* Water saved */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
              <div className="flex items-center justify-center">
                <Droplet className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-white">
              <p className="text-lg font-medium">26L saved</p>
              <p className="text-sm text-white/80">4 Invitations left</p>
            </div>
          </div>
        </motion.div>
        {/* Subscription section - open modal */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4 cursor-pointer"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          onClick={() => setShowSubscription(true)}
        >
          <h2 className="text-white text-lg mb-3">Your Subscription</h2>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">{user?.water_subscription_status === 'active' ? 'Water Bar Premium' : 'No Active Plan'}</p>
                <p className="text-white/70 text-sm">{user?.water_subscription_status === 'active' ? 'AED 40/month' : 'No subscription'}</p>
              </div>
            </div>
            <motion.div
              className={`px-3 py-1 rounded-full ${user?.water_subscription_status === 'active' ? 'bg-green-500/30' : 'bg-gray-400/30'} text-white text-xs`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              {user?.water_subscription_status === 'active' ? 'Active' : 'Not Subscribed'}
            </motion.div>
          </div>
          <div className="space-y-2 text-white/80 text-sm">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-white mr-2" />
              <span>Unlimited public water refills</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-white mr-2" />
              <span>Rituals & intention guidance</span>
            </div>
            <div className="flex items-center">
              <Check className="w-4 h-4 text-white mr-2" />
              <span>Daily hydration nudges</span>
            </div>
          </div>
        </motion.div>
        {/* Subscription Modal */}
        {showSubscription && (
          <ManageSubscriptionPanel
            status={user?.water_subscription_status}
            open={showSubscription}
            onClose={() => setShowSubscription(false)}
            stripeCustomerId={user?.stripe_customer_id}
          />
        )}
        {/* Payment method */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-medium">Payment Method</p>
                <p className="text-white/70 text-sm">Visa •••• 4242</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/70" />
          </div>
        </motion.div>
        {/* Upcoming event */}
        <motion.div
          className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-5 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center mr-3">
              <div className="flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-white">
              <p className="text-lg font-medium">Upcoming event</p>
              <p className="text-sm text-white/80">Crystal Garden</p>
            </div>
          </div>
        </motion.div>
        {/* View impact button */}
        <motion.button
          className="mt-auto mx-auto px-8 py-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white uppercase tracking-wide text-sm"
          whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          View Impact
        </motion.button>
      </div>
    </div>
  );
}
