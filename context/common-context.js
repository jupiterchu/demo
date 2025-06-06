'use client';
import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "./supabase-context";

const CommonContext = createContext();

export const CommonProvider = ({ children }) => {
  const { supabase } = useSupabase()
  const [showLoginModal, setShowLoginModal] = useState(false)
  // 如果用户刷新页面，那么useConext中的值，是会被充值的
  const [userData, setUserData] = useState()
  const [showAuthUI, setShowAuthUI] = useState(false)
  const [clickSideBar, setClickSideBar] = useState()
  const [showUpgrade, setShowUpgrade] = useState(false)

  async function init() {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setShowLoginModal(true)
    } else {
      setUserData(user)
    }
  }

  useEffect(() => {
    init()
  }, [])

  return (
    <CommonContext.Provider
      value={{
        showLoginModal, setShowLoginModal,
        userData, setUserData,
        showAuthUI, setShowAuthUI,
        clickSideBar, setClickSideBar,
        showUpgrade, setShowUpgrade,
      }}
    >
      {children}
    </CommonContext.Provider>
  );
};


export const useCommonContext = () => useContext(CommonContext)