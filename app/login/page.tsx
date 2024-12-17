'use client';

import { useEffect } from "react";
import { getGetCredOptions, getGetCredOptionsUsernameless, validateAssertionResult } from "../lib/api";
import { startAuthentication } from "@simplewebauthn/browser";

export default function Login() {

    useEffect(() => {    
      const asyncWrapper = async (): Promise<void> => {
        const credOptions = await getGetCredOptionsUsernameless();
        
        credOptions.useBrowserAutofill = true
        const assertion = await startAuthentication(credOptions)
        await validateAssertionResult(assertion)

        window.localStorage.setItem("loggedIn", "true");
        window.location.href = "/messages";
      }
      asyncWrapper();
    })

    async function handleAuth(e) {
      const { email } = e.target.elements;
      e.preventDefault();

      const assertionOptions = await getGetCredOptions(email.value);
      const assertion = await startAuthentication(assertionOptions);
      await validateAssertionResult(assertion);

      
      window.localStorage.setItem("loggedIn", "true");
      window.location.href = "/messages";
    }
    


    return (
      <>
        {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-white">
          <body class="h-full">
          ```
        */}
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              className="mx-auto h-10 w-auto"
            />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight dark:text-gray-50 text-gray-900 ">
              Sign in to your account
            </h2>
          </div>
  
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form action="#" method="POST" className="space-y-6" onSubmit={handleAuth}>
              <div>
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-gray-50">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email webauthn"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>
  
            <p className="mt-10 text-center text-sm/6 text-gray-500">
              Not a member?{' '}
              <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Register
              </a>
            </p>
          </div>
        </div>
      </>
    )
  }
  