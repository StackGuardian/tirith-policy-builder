import { Box, Typography } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { useImmer } from "use-immer"
import {
  Button,
  SpaceBetween,
  Container,
  FormField,
  Input,
  Form,
  Select,
  Box as CSBox,
  Textarea,
  Link,
  Autosuggest,
  TextContent,
  Alert,
  Flashbar,
  Modal,
  Icon,
  Grid,
  ButtonDropdown
} from "@cloudscape-design/components"
import StatusIndicator from "@cloudscape-design/components/status-indicator"
import Popover from "@cloudscape-design/components/popover"
import tirithServices from "./services/tirithServices"
import CustomMultiSelect from "./CustomMultiSelect"
import _, { isArray } from "lodash"
import AWSInfracostResources from "./assets/policies/infracost_resource_aws.json"
import AzureInfracostResources from "./assets/policies/infracost_resource_azure.json"
import MonacoEditorWidget from "./MonacoEditorWidget"
import CustomErrorBoundary from "./CustomErrorBoundary"
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  )
}

const wfObject = {
  ResourceName: "",
  Description: "",
  Tags: [],
  EnvironmentVariables: [
    {
      kind: "",
      config: {
        textValue: "",
        varName: ""
      }
    }
  ],
  DeploymentPlatformConfig: [
    {
      kind: "",
      config: {
        integrationId: ""
      }
    }
  ],
  WfStepsConfig: [
    {
      wfStepTemplateId: "",
      name: "",
      approval: true,
      wfStepInputData: {
        schemaType: "",
        data: ""
      }
    }
  ],
  VCSConfig: {
    iacVCSConfig: {
      useMarketplaceTemplate: "",
      iacTemplate: "",
      iacTemplateId: "",
      customSource: {
        sourceConfigDestKind: "",
        config: {
          includeSubModule: "",
          ref: "",
          gitCoreAutoCRLF: "",
          auth: "",
          workingDir: "",
          repo: "",
          gitSparseCheckoutConfig: "",
          isPrivate: ""
        }
      }
    },
    iacInputData: {
      schemaType: "",
      data: ""
    }
  },
  MiniSteps: {
    wfChaining: {
      COMPLETED: [
        {
          workflowGroupId: "",
          workflowRunPayload: "",
          workflowId: "",
          stackId: ""
        }
      ],
      ERRORED: [
        {
          workflowGroupId: "",
          workflowRunPayload: "",
          workflowId: "",
          stackId: ""
        }
      ]
    }
    // notifications: {
    //   email: {
    //     APPROVAL_REQUIRED: [],
    //     CANCELLED: [],
    //     COMPLETED: [],
    //     ERRORED: []
    //   }
    // }
  },
  Approvers: [""],
  GitHubComSync: {
    pull_request_opened: {
      createWfRun: {
        enabled: ""
      }
    }
  },
  UserSchedules: [
    {
      state: "",
      cron: "",
      inputs: {
        VCSConfig: {
          iacInputData: {
            schemaType: "",
            data: ""
          }
        }
      },
      name: ""
    }
  ],
  UserJobCPU: "",
  UserJobMemory: "",
  RunnerConstraints: {
    type: "",
    selectors: []
  },
  TerraformConfig: {
    managedTerraformState: "",
    terraformVersion: "",
    driftCheck: "",
    prePlanWfStepsConfig: [
      {
        name: "",
        cmdOverride: "",
        wfStepTemplateId: "",
        approval: false
      }
    ],
    postApplyWfStepsConfig: [
      {
        name: "",
        cmdOverride: "",
        wfStepTemplateId: "",
        approval: false
      }
    ],
    preApplyWfStepsConfig: [
      {
        name: "",
        cmdOverride: "",
        wfStepTemplateId: "",
        approval: false
      }
    ]
  }
}

const getNestedObjDotOptions = (obj, propStr = "") => {
  let tmp = []
  Object.entries(obj).forEach(([key, val]) => {
    const nestedPropStr = propStr + (propStr ? "." : "") + key
    let nestedPropStr_ = null
    if (Array.isArray(obj)) {
      nestedPropStr_ = propStr + (propStr ? "." : "") + "*"
    }
    if (typeof val === "object") {
      tmp = tmp.concat(getNestedObjDotOptions(val, nestedPropStr))
      if (nestedPropStr_) {
        tmp = tmp.concat(getNestedObjDotOptions(val, nestedPropStr_))
      }
    } else {
      if (!nestedPropStr?.includes("0")) {
        tmp.push({
          label: nestedPropStr,
          type: typeof val
        })
      }
      if (nestedPropStr_ && !nestedPropStr_?.includes("0")) {
        tmp.push({
          label: nestedPropStr_,
          type: typeof val
        })
      }
    }
  })
  return tmp
}

const providerOptions = [
  { label: "Terraform Plan", value: "stackguardian/terraform_plan" },
  { label: "Infracost", value: "stackguardian/infracost" },
  { label: "SG Workflow (JSON)", value: "stackguardian/json" },
  { label: "Kubernetes", value: "stackguardian/kubernetes" }
]

const cloudProviderOptions = [
  { label: "AWS", value: "aws_latest" },
  { label: "Azure", value: "azure_latest" },
  // { label: 'GCP', value: 'gcp_latest' },
  { label: "Other", value: "other" }
]

const defaultResourceOptions = [
  { label: "AWS S3 Bucket", value: "aws_s3_bucket" },
  { label: "AWS EC2 Instance", value: "aws_instance" },
  { label: "AWS ACM Certificate", value: "aws_acm_certificate" },
  { label: "AWS LB", value: "aws_lb" },
  { label: "AWS LB Listener", value: "aws_lb_listener" },
  { label: "AWS LB Target Group", value: "aws_lb_target_group" },
  { label: "AWS API Gateway", value: "aws_apigatewayv2_api" },
  { label: "AWS Autoscaling Group", value: "aws_autoscaling_group" },
  { label: "AWS Cloudwatch Log Group", value: "aws_cloudwatch_log_group" },
  { label: "AWS Cognito User Pools", value: "aws_cognito_user_pools" },
  { label: "AWS DB Instance", value: "aws_db_instance" },
  { label: "AWS DynamoDB Table", value: "aws_dynamodb_table" },
  { label: "AWS EC2 Host", value: "aws_ec2_host" },
  { label: "AWS Amplify App", value: "aws_amplify_app" },
  { label: "AWS Launch Configuration", value: "aws_launch_configuration" },
  { label: "AWS Cognito Identity Pool", value: "aws_cognito_identity_pool" },
  { label: "AWS Key Pair", value: "aws_key_pair" },
  { label: "AWS ECS Cluster", value: "aws_ecs_cluster" },
  { label: "AWS EFS Filesystem", value: "aws_efs_file_system" },
  { label: "AWS EKS Cluster", value: "aws_eks_cluster" },
  { label: "AWS Lambda Function", value: "aws_lambda_function" },
  { label: "AWS Route53 Record", value: "aws_route53_record" },
  { label: "AWS EC2 Transit Gateway", value: "aws_ec2_transit_gateway" },
  { label: "Azure API Management", value: "azurerm_api_management" },
  { label: "Azure Active Directory Domain Service", value: "azurerm_active_directory_domain_service" },
  { label: "Azure APP Configuration", value: "azurerm_app_configuration" },
  { label: "Azure Availability Set", value: "azurerm_availability_set" },
  { label: "Azure Linux Virtual Machine", value: "azurerm_linux_virtual_machine" },
  { label: "Azure Windows Virtual Machine", value: "azurerm_windows_virtual_machine" },
  { label: "Azure Storage Blob", value: "azurerm_storage_blob" },
  { label: "Google API Gateway App", value: "google_api_gateway_app" },
  { label: "Google Apigee Instance", value: "google_apigee_instance" },
  { label: "Google App Engine Application", value: "google_app_engine_application" },
  { label: "Google Cloudfunctions Functions", value: "google_cloudfunctions_function" },
  { label: "Google Compute Instance", value: "google_compute_instance" }
]

// const defaultResourceAtrributeOptions =[
//   { label: 'aws_s3_bucket', value: 'aws_s3_bucket' },
// ]

const flattenNestedAttributes = (attributes, parent = "") => {
  //Takes Obj of terraform attribute and returns a list of objs
  //OBJ includes finalAttributeId and the rest of the attribute details

  let finalAttributes = []
  try {
    if (attributes?.block) {
      //map direct attributes
      if (attributes?.block?.attributes) {
        Object.keys(attributes?.block?.attributes).map((key, index) => {
          let newAttr = {
            ...attributes?.block?.attributes[key],
            finalAttributeId: parent + key
          }
          finalAttributes.push(newAttr)
        })
      }
      if (attributes?.block?.block_types) {
        Object.keys(attributes?.block?.block_types).map((key, index) => {
          //push parent attr
          let newAttr = {
            ...attributes?.block?.block_types[key],
            finalAttributeId: parent + key
          }
          finalAttributes.push(newAttr)
          let parentKeySuffix = "."
          if (attributes?.block?.block_types[key]?.nesting_mode === "list") {
            parentKeySuffix = ".0."
          }
          if (attributes?.block?.block_types[key]?.nesting_mode === "set") {
            parentKeySuffix = ".*."
          }
          if (attributes?.block?.block_types[key]?.nesting_mode === "single") {
            parentKeySuffix = "."
          }
          let currentBlockChildren = flattenNestedAttributes(attributes?.block?.block_types[key], parent + key + parentKeySuffix)
          finalAttributes = [...finalAttributes, ...currentBlockChildren]
        })
      }
    }
  } catch (e) {
    console.log(e)
  }
  return finalAttributes
}

const defaultResourceAtrributeOptions = resource_type => {
  if (resource_type === "aws_s3_bucket") {
    return [
      { label: "bucket_prefix", value: "bucket_prefix" },
      { label: "acl", value: "acl" },
      { label: "cors_rule", value: "cors_rule" },
      { label: "force_destroy", value: "force_destroy" },
      { label: "bucket_prefix", value: "bucket_prefix" },
      { label: "object_lock_enabled", value: "object_lock_enabled" },
      { label: "bucket_prefix", value: "bucket_prefix" },
      { label: "versioning", value: "versioning" },
      { label: "tags", value: "tags" },
      { label: "website", value: "website" },
      { label: "server_side_encryption_configuration", value: "server_side_encryption_configuration" },
      { label: "replication_configuration", value: "replication_configuration" },
      { label: "policy", value: "policy" }
    ]
  }
  if (resource_type === "aws_instance") {
    return [
      { label: "ami", value: "ami" },
      { label: "associate_public_ip_address", value: "associate_public_ip_address" },
      { label: "availability_zone", value: "availability_zone" },
      { label: "cpu_core_count", value: "cpu_core_count" },
      { label: "ebs_block_device", value: "ebs_block_device" },
      { label: "ebs_optimized", value: "ebs_optimized" },
      { label: "ephemeral_block_device", value: "ephemeral_block_device" },
      { label: "iam_instance_profile", value: "iam_instance_profile" },
      { label: "instance_type", value: "instance_type" },
      { label: "launch_template", value: "launch_template" },
      { label: "monitoring", value: "monitoring" },
      { label: "subnet_id", value: "subnet_id" }
    ]
  }
  return []
}

const evaluatorOptions = [
  { label: "Equals", value: "Equals" },
  { label: "Not Equal", value: "NotEquals" },
  { label: "Contained In", value: "ContainedIn" },
  { label: "Not Contained In", value: "NotContainedIn" },
  { label: "Contains", value: "Contains" },
  { label: "Greater Than Equal To", value: "GreaterThanEqualTo" },
  { label: "Greater Than", value: "GreaterThan" },
  { label: "Is Empty", value: "IsEmpty" },
  { label: "Is Not Empty", value: "IsNotEmpty" },
  { label: "Less Than EqualTo", value: "LessThanEqualTo" },
  { label: "Less Than", value: "LessThan" },
  { label: "Regex Match", value: "RegexMatch" }
]

const getProviderFromPolicy = policy => {
  if (policy && policy?.meta?.required_provider) {
    return policy?.meta?.required_provider
  }
  return ""
}

const getEvaluatorsFromPolicy = policy => {
  if (policy && policy?.evaluators) {
    return policy?.evaluators
  }
  return []
}
const getOperationTypesFromPolicy = policy => {
  let provider = getProviderFromPolicy(policy)
  if (provider === "stackguardian/terraform_plan") {
    return [
      { label: "Check for terraform resource attribute", value: "attribute" },
      { label: "Check for terraform action", value: "action" },
      { label: "Check for terraform resource count", value: "count" },
      { label: "Check for terraform resource direct references", value: "direct_references" },
      { label: "Check for terraform resource direct dependencies", value: "direct_dependencies" }
    ]
  }
  if (provider === "stackguardian/infracost") {
    return [
      { label: "Total Monthly Cost", value: "total_monthly_cost" },
      { label: "Total Hourly cost", value: "total_hourly_cost" }
    ]
  }
  if (provider === "stackguardian/json") {
    return [{ label: "Get Value", value: "get_value" }] // let res = getDynamicOptionsForJSONPolicy(wfObject);
  }
  if (provider === "stackguardian/kubernetes") {
    return [{ label: "Attribute", value: "attribute" }]
  }
  return []
}

const empty_evaluator_obj = {
  id: "",
  description: "",
  provider_args: {
    operation_type: "",
    terraform_resource_type: "",
    terraform_resource_attribute: ""
  },
  condition: {
    type: "Equals",
    value: "",
    error_tolerance: 0
  }
}

const empty_evaluator_obj_json = {
  id: "",
  description: "",
  provider_args: {
    operation_type: "get_value",
    key_path: ""
  },
  condition: {
    type: "Equals",
    value: "",
    error_tolerance: 0
  }
}

const empty_evaluator_obj__kubernetes = {
  id: "",
  description: "",
  provider_args: {
    operation_type: "attribute",
    kubernetes_kind: "Pod",
    attribute_path: ""
  },
  condition: {
    type: "Equals",
    value: "",
    error_tolerance: 0
  }
}

const defaultPolicy = {
  meta: {
    required_provider: "stackguardian/terraform_plan",
    version: "v1"
  },
  evaluators: [],
  eval_expression: ""
}
const TirithPolicyBuilder = props => {
  const { value, onChange, shouldEnterPolicyName, policyName, setPolicyName, disabled, setHasErrors } = props
  const [generatedPolicy, setGeneratedPolicy] = useImmer(value || defaultPolicy)
  const [terraformResourceOptions, setTerraformResourceOptions] = useState(defaultResourceOptions)
  const [cloudResourcesList, setCloudResourcesList] = useImmer({
    aws_latest: [],
    azure_latest: [],
    gcp_latest: [],
    other: []
  })
  const [resourceAttributeOptions, setResourceAttributeOptions] = useImmer({})
  //Limitation: Will work upto 99 evalutators
  const [selectedCloudProvider, setSelectedCloudProvider] = useImmer(Array(99).fill({ label: "", value: "" }))
  const [terraformResourceAttributeOptions, setterraformResourceAttributeOptions] = useImmer(Array(99).fill([]))
  const [isShowPolicyJSON, setIsShowPolicyJSON] = useState(false)

  const showEvalExpressionWarning = generatedPolicy?.evaluators?.filter(item => generatedPolicy?.eval_expression?.indexOf(item?.id) === -1)?.length > 0

  const getConditionTypeOptions = (provider, evaluator) => {
    //[{ label: 'check 1', value: 'check-1' }]
    let map = {
      "stackguardian/terraform_plan.attribute": evaluatorOptions,
      "stackguardian/terraform_plan.action": evaluatorOptions,
      "stackguardian/terraform_plan.count": evaluatorOptions,
      "stackguardian/infracost.total_hourly_cost": evaluatorOptions,
      "stackguardian/infracost.total_monthly_cost": evaluatorOptions,
      "stackguardian/json.attr_1.get_value": evaluatorOptions,
      "NULL.NULL": evaluatorOptions
    }

    try {
      let operation_type = evaluator?.provider_args?.operation_type

      // Format : ${provider.operation_type}
      let expr = `${provider ? provider : "NULL"}.${operation_type ? operation_type : "NULL"}`

      if (map?.[expr]) {
        return map?.[expr]
      } else {
        return evaluatorOptions
      }
    } catch (err) {
      console.log(`Err while deciding condition type options : ${err.toString()}`)
      return evaluatorOptions
    }
  }

  const autoCompleteEvaluator = evaluator => {
    let map = {
      // 'NULL.attr_1': {
      //   type: 'LessThanEqualTo',
      //   value: 100
      // },
      // 'type_1.NULL': {
      //   terraform_resource_attribute: 'this_is_attr',
      //   type: 'IsEmpty',
      //   value: 10
      // },
      // 'type_2.attr_2': {
      //   type: 'NotEquals',
      //   value: { test: 2 }
      // },
      "NULL.NULL": {
        type: "",
        value: ""
      }
    }

    try {
      let terraform_resource_type = evaluator?.provider_args?.terraform_resource_type
      let terraform_resource_attribute = evaluator?.provider_args?.terraform_resource_attribute

      // Format : ${terraform_resource_type.terraform_resource_attribute}
      let expr = `${terraform_resource_type ? terraform_resource_type : "NULL"}.${terraform_resource_attribute ? terraform_resource_attribute : "NULL"}`

      if (map?.[expr]) {
        return map?.[expr]
      } else {
        return {}
      }
    } catch (err) {
      console.log(`Err while auto filling tirith builder : ${err.toString()}`)
      return {}
    }
  }

  const getKeyPathOption = () => {
    let res = getNestedObjDotOptions(wfObject).map(item => {
      return { label: item.label, value: item.label, labelTag: item.type }
    })
    res.push({ label: "CheckForDeprecatedTemplate", value: "CheckForDeprecatedTemplate", labelTag: "string" })
    return res
  }

  const getAttributePathOptions = () => {
    const options = []
    return options
  }

  const fetchCloudResources = async (tirithProvider, cloudProvider) => {
    if (tirithProvider === "infracost") {
      let tempCloudResourcesList = []
      try {
        if (cloudProvider === "aws_latest") {
          Object.keys(AWSInfracostResources).map(key => {
            let resObj = { label: key, value: key }
            if (AWSInfracostResources[key]?.notes) {
              resObj.description = AWSInfracostResources[key]?.notes
            }
            tempCloudResourcesList.push(resObj)
          })
        }
        if (cloudProvider === "azure_latest") {
          Object.keys(AzureInfracostResources).map(key => {
            let resObj = { label: key, value: key }
            if (AzureInfracostResources[key]?.notes) {
              resObj.description = AzureInfracostResources[key]?.notes
            }
            tempCloudResourcesList.push(resObj)
          })
        }
      } catch (e) {
        console.log(e)
      }
      setCloudResourcesList(draft => {
        draft[cloudProvider] = tempCloudResourcesList
      })
      return
    }
    const { data, error } = await tirithServices.getCloudResources("terraform_plan", cloudProvider)
    if (error) {
      //TODO: Handle Error
    }

    if (data && data?.length > 0 && typeof data !== "string") {
      setCloudResourcesList(draft => {
        draft[cloudProvider] = data?.map(item => {
          return { value: item, label: item }
        })
      })
    }
  }
  const fetchResourceAttributeOptions = async (tirithProvider, cloudProvider, resourceName) => {
    const { data, error } = await tirithServices.getResourceAttributes(tirithProvider, cloudProvider, resourceName)
    if (error) {
      //TODO: Handle Error
    }

    if (data && data?.block?.attributes) {
      let cloudResourcesList = flattenNestedAttributes(data)

      setResourceAttributeOptions(draft => {
        draft[resourceName] = cloudResourcesList
      })
    }
  }

  useEffect(() => {
    if (!_.isEqual(value, generatedPolicy) && value) {
      setGeneratedPolicy(value)
    }
  }, [value])

  useEffect(() => {
    onChange(generatedPolicy)
    if (generatedPolicy?.evaluators && generatedPolicy?.evaluators?.length) {
      generatedPolicy?.evaluators.forEach((evaluator, index) => {
        let keyForResourceType = generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" ? "terraform_resource_type" : "resource_type"
        if (evaluator?.provider_args?.[keyForResourceType] && selectedCloudProvider[index]?.value === "") {
          if (evaluator?.provider_args?.[keyForResourceType] && evaluator?.provider_args?.[keyForResourceType]?.includes("aws")) {
            setSelectedCloudProvider(draft => {
              draft[index] = { label: "AWS", value: "aws_latest" }
            })
            fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "aws_latest")
            if (!resourceAttributeOptions[evaluator?.provider_args?.[keyForResourceType]]) {
              fetchResourceAttributeOptions(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "aws_latest", evaluator?.provider_args?.[keyForResourceType])
            }
          }
          if (evaluator?.provider_args?.[keyForResourceType] && evaluator?.provider_args?.[keyForResourceType]?.includes("azure")) {
            setSelectedCloudProvider(draft => {
              draft[index] = { label: "Azure", value: "azure_latest" }
            })
            fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "azure_latest")
            if (!resourceAttributeOptions[evaluator?.provider_args?.[keyForResourceType]]) {
              fetchResourceAttributeOptions(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "azure_latest", evaluator?.provider_args?.[keyForResourceType])
            }
          }
          if (evaluator?.provider_args?.[keyForResourceType] && evaluator?.provider_args?.[keyForResourceType]?.includes("gcp")) {
            setSelectedCloudProvider(draft => {
              draft[index] = { label: "GCP", value: "gcp_latest" }
            })
            fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "gcp_latest")
            if (!resourceAttributeOptions[evaluator?.provider_args?.[keyForResourceType]]) {
              fetchResourceAttributeOptions(generatedPolicy?.meta?.required_provider?.split("/")?.[1], "gcp_latest", evaluator?.provider_args?.[keyForResourceType])
            }
          }
        }
        if (generatedPolicy?.meta?.required_provider === "stackguardian/json") {
          generatedPolicy?.evaluators.forEach((evaluator, index) => {
            if (!evaluator?.provider_args?.opertaion_type) {
              setGeneratedPolicy(draft => {
                draft.evaluators[index].provider_args.operation_type = "get_value"
              })
            }
          })
        }
      })
    }
    // if (generatedPolicy?.evaluators && generatedPolicy?.evaluators?.length) {
    //   generatedPolicy?.evaluators.forEach((evaluator, index) => {
    //     if (
    //       generatedPolicy?.meta?.required_provider === 'stackguardian/terraform_plan' &&
    //       evaluator?.provider_args?.operation_type === 'attribute'
    //     ) {
    //       let defAttrs = defaultResourceAtrributeOptions(evaluator?.provider_args?.terraform_resource_type);
    //       setterraformResourceAttributeOptions(draft => {
    //         draft[index] = defAttrs;
    //       });
    //     }
    //   });
    // }
  }, [generatedPolicy])

  const is_SG_Wf_Policy = policy => {
    let wfAttrs = [
      "ResourceName",
      "Description",
      "Tags",
      "IsActive",
      "WfStepsConfig",
      "WfType",
      "TerraformConfig",
      "EnvironmentVariables",
      "DeploymentPlatformConfig",
      "VCSConfig",
      "UserSchedules",
      "GitHubComSync",
      "MiniSteps",
      "Approvers"
    ]

    let evaluator = policy?.evaluator || []
    for (let i = 0; i < evaluator.length; i++) {
      let keyPath = evaluator[i]?.keyPath
      if (keyPath === "") {
        continue
      }
      for (let y = 0; y < wfAttrs.length; y++) {
        if (keyPath.includes(wfAttrs[y])) {
          return true
        }
      }
    }
    return false
  }

  function isUniqueEvalId(arr) {
    var tmpArr = []
    for (var obj in arr) {
      if (tmpArr.indexOf(arr[obj]?.id) < 0) {
        tmpArr.push(arr[obj]?.id)
      } else {
        return false
      }
    }
    return true
  }

  const validateGeneratedPolicy = generatedPolicy => {
    let errors = []
    // if (generatedPolicy?.eval_expression && generatedPolicy?.eval_expression.trim() === '') {
    //   errors?.push({
    //     type: 'error',
    //     content: (
    //       <Typography
    //         style={{ color: 'white', fontSize: '15px', fontWeight: '400' }}
    //       >{`Final expression must be a valid logical expression`}</Typography>
    //     ),
    //     dismissible: true,
    //     id: `generatedPolicy-eval-expression`
    //   });
    // }
    generatedPolicy?.evaluators?.map((evaluator, index) => {
      if (!evaluator?.id || evaluator?.id?.trim() === "") {
        errors?.push({
          type: "error",
          content: <Typography style={{ color: "white", fontSize: "15px", fontWeight: "400" }}>{`Please enter a valid evaluator id for ${index + 1} evaluator`}</Typography>,
          dismissible: true,
          id: `${index}`
        })
      }
    })
    if (!isUniqueEvalId(generatedPolicy?.evaluators)) {
      errors?.push({
        type: "error",
        content: <Typography style={{ color: "white", fontSize: "15px", fontWeight: "400" }}>{`Evaluator Ids must be unique`}</Typography>,
        dismissible: true,
        id: `unique-eval-id`
      })
    }

    if (errors.length > 0 && props.setHasErrors) {
      setHasErrors(true)
    } else {
      setHasErrors(false)
    }

    return errors
  }

  const handleCopyPolicyJSON = policy => {
    navigator.clipboard.writeText(policy)
  }

  const getTfResourceTypeOptions = list => {
    return (list || []).map(item => {
      if (item?.computed === true && !item?.optional) {
        return {
          value: item?.finalAttributeId,
          label: `${item?.finalAttributeId} (${item?.type ? `type:${item.type.toString()}` : ``}${item?.computed ? `, computed:${item.computed.toString()}` : ``}${
            item?.optional ? `, optional:${item.optional.toString()}` : ``
          })`,
          iconName: "status-warning"
        }
      } else {
        return {
          value: item?.finalAttributeId,
          label: `${item?.finalAttributeId} (${item?.type ? `type:${item.type.toString()}` : ``}${item?.computed ? `, computed:${item.computed.toString()}` : ``}${
            item?.optional ? `, optional:${item.optional.toString()}` : ``
          })`,
          disabled: false
        }
      }
    })
  }

  const getSelectedResourceTypeOption = (val, list) => {
    let options = getTfResourceTypeOptions(list)
    let idx = options.findIndex(itm => itm?.value === val)
    if (idx !== -1) {
      return options[idx]
    }
    return null
  }

  const getButtonDropDownSelection = providerArg => {
    if (providerArg?.hasOwnProperty("referenced_by")) {
      return "Referenced by"
    }
    if (providerArg?.hasOwnProperty("references_to")) {
      return "References to"
    } else {
      return ""
    }
  }

  return (
    <Box>
      <form onSubmit={e => e.preventDefault()}>
        <Form>
          <Box mb={2} mx={1}>
            <Box mb={2} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
              <div>
                <TextContent>
                  <h1> Tirith Policy</h1>
                </TextContent>
                <Box>
                  Check Tirith documentation{" "}
                  <Link href="https://github.com/StackGuardian/tirith" target="_blank">
                    here
                  </Link>
                </Box>
              </div>
              <div>
                <Button
                  onClick={() => {
                    setIsShowPolicyJSON(true)
                  }}
                >
                  Policy JSON
                </Button>
              </div>
            </Box>
            <SpaceBetween direction="vertical" size="s">
              {shouldEnterPolicyName && (
                <FormField
                  // description="This is a description."
                  label="Policy Name"
                >
                  <Input value={policyName} onChange={event => setPolicyName(event.detail.value)} readOnly={disabled} />
                </FormField>
              )}
              <CSBox variant="awsui-key-label">Select Provider</CSBox>
              <Select
                filteringType="auto"
                disabled={disabled}
                selectedOption={providerOptions.find(val => val.value === getProviderFromPolicy(generatedPolicy))}
                onChange={({ detail }) => {
                  setGeneratedPolicy(draft => {
                    draft.meta.required_provider = detail.selectedOption.value
                    draft.evaluators = []
                  })
                }}
                options={providerOptions}
                selectedAriaLabel="Select Provider"
                placeholder="Select Provider"
              />
              {validateGeneratedPolicy(generatedPolicy).length > 0 && <Flashbar items={validateGeneratedPolicy(generatedPolicy)} />}
              <SpaceBetween direction="vertical" size="l">
                {getEvaluatorsFromPolicy(generatedPolicy).map((evaluator, index) => {
                  return (
                    <Container key={index.toString()}>
                      <SpaceBetween direction="vertical" size="l">
                        <FormField label="Evaluator Id*">
                          <Input
                            disabled={disabled}
                            onChange={({ detail }) => {
                              setGeneratedPolicy(draft => {
                                // draft.eval_expression = draft?.eval_expression?.replace(
                                //   `${draft.evaluators[index].id}`,
                                //   detail.value
                                // );
                                draft.evaluators[index].id = detail.value
                              })
                            }}
                            value={generatedPolicy?.evaluators?.[index]?.id}
                          />
                        </FormField>
                        <FormField label="Description">
                          <Input
                            disabled={disabled}
                            onChange={({ detail }) => {
                              setGeneratedPolicy(draft => {
                                draft.evaluators[index].description = detail.value
                              })
                            }}
                            value={generatedPolicy?.evaluators?.[index]?.description}
                          />
                        </FormField>
                        <FormField label="Operation Type">
                          <Select
                            filteringType="auto"
                            disabled={disabled}
                            selectedOption={getOperationTypesFromPolicy(generatedPolicy).find(val => val.value === generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type) || ""}
                            onChange={({ detail }) => {
                              setGeneratedPolicy(draft => {
                                draft.evaluators[index].provider_args.operation_type = detail.selectedOption.value
                                if (generatedPolicy?.meta?.required_provider === "stackguardian/json") {
                                  draft.evaluators[index].provider_args.key_path = ""
                                }
                                if (generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan") {
                                  draft.evaluators[index].provider_args.references_to = ""
                                }

                                if (detail.selectedOption.value !== "direct_references") {
                                  delete draft?.evaluators[index]?.provider_args?.references_to
                                  delete draft?.evaluators[index]?.provider_args?.referenced_by
                                }
                              })
                              if (detail.selectedOption.value === "action") {
                                setGeneratedPolicy(draft => {
                                  draft.evaluators[index].condition.type = "ContainedIn"
                                })
                              }
                              if (generatedPolicy?.meta?.required_provider === "stackguardian/infracost") {
                                fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], selectedCloudProvider?.[index]?.value)
                              }
                            }}
                            options={getOperationTypesFromPolicy(generatedPolicy)}
                            selectedAriaLabel="Select Operation Type"
                            placeholder="Select Operation Type"
                          />
                        </FormField>
                        {generatedPolicy?.meta?.required_provider === "stackguardian/kubernetes" && generatedPolicy?.evaluators?.[index]?.provider_args?.kubernetes_kind && (
                          <FormField label="Kubernetes Kind">
                            <Select
                              disabled={disabled}
                              selectedOption={{
                                label: generatedPolicy?.evaluators?.[index]?.provider_args?.kubernetes_kind,
                                value: generatedPolicy?.evaluators?.[index]?.provider_args?.kubernetes_kind
                              }}
                              onChange={({ detail }) => {
                                setGeneratedPolicy(draft => {
                                  draft.evaluators[index].provider_args.kubernetes_kind = detail.selectedOption.value
                                  if (generatedPolicy?.meta?.required_provider === "stackguardian/kubernetes") {
                                    draft.evaluators[index].provider_args.key_path = ""
                                  }
                                })
                              }}
                              options={[{ label: "Pod", value: "Pod" }]}
                              selectedAriaLabel="Select Kubernetes Kind"
                              placeholder="Select Kubernetes Kind"
                            />
                          </FormField>
                        )}
                        {generatedPolicy?.meta?.required_provider === "stackguardian/kubernetes" && generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type === "attribute" && (
                          <FormField label="Attribute">
                            <Autosuggest
                              disabled={disabled}
                              value={generatedPolicy?.evaluators?.[index]?.provider_args?.attribute_path ?? ""}
                              enteredTextLabel={value => `Use: "${value}"`}
                              virtualScroll
                              expandToViewport
                              options={getAttributePathOptions() || []}
                              placeholder="Search Attribute Paths"
                              onChange={({ detail }) => {
                                setGeneratedPolicy(draft => {
                                  draft.evaluators[index].provider_args.attribute_path = detail.value
                                })
                              }}
                            />
                          </FormField>
                        )}

                        {generatedPolicy?.meta?.required_provider === "stackguardian/json" && generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type && (
                          <FormField label="Workflow Attribute">
                            <Autosuggest
                              disabled={disabled}
                              value={generatedPolicy?.evaluators?.[index]?.provider_args?.key_path ?? ""}
                              enteredTextLabel={value => `Use: "${value}"`}
                              virtualScroll
                              expandToViewport
                              options={getKeyPathOption() || []}
                              placeholder="Search Key Paths"
                              onChange={({ detail }) => {
                                setGeneratedPolicy(draft => {
                                  draft.evaluators[index].provider_args.key_path = detail.value
                                })
                              }}
                            />
                          </FormField>
                        )}

                        {generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" && generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type === "attribute" && (
                          <>
                            <Box display={"flex"} flexDirection="row" width={"66%"}>
                              <Box flex={0.5} mr={2}>
                                <FormField label="Cloud Provider">
                                  <Select
                                    filteringType="auto"
                                    disabled={disabled}
                                    selectedOption={selectedCloudProvider[index]}
                                    onChange={({ detail }) => {
                                      setSelectedCloudProvider(draft => {
                                        draft[index] = detail.selectedOption
                                      })
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args.terraform_resource_type = ""
                                      })
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args.terraform_resource_attribute = ""
                                      })
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].condition.value = ""
                                      })
                                      fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], detail.selectedOption.value)
                                    }}
                                    options={cloudProviderOptions}
                                    selectedAriaLabel="Select Cloud Provider"
                                    placeholder="Select Cloud Provider"
                                  />
                                </FormField>
                              </Box>

                              <Box flex={2}>
                                <FormField label="Terraform Resource Type">
                                  <Autosuggest
                                    disabled={disabled}
                                    value={generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_type}
                                    enteredTextLabel={value => `Use: "${value}"`}
                                    virtualScroll
                                    expandToViewport
                                    options={cloudResourcesList?.[selectedCloudProvider[index]?.value] || []}
                                    placeholder="Search Resource"
                                    onChange={({ detail }) => {
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args.terraform_resource_type = detail.value

                                        //AutoFill
                                        // let { terraform_resource_attribute, type, value } = autoCompleteEvaluator(
                                        //   draft.evaluators[index]
                                        // );
                                        // if (terraform_resource_attribute) {
                                        //   draft.evaluators[
                                        //     index
                                        //   ].provider_args.terraform_resource_attribute = terraform_resource_attribute;
                                        // }
                                        // if (type) {
                                        //   draft.evaluators[index].condition.type = type;
                                        // }
                                        // if (value) {
                                        //   draft.evaluators[index].condition.value = value;
                                        // }
                                      })
                                      setterraformResourceAttributeOptions(draft => {
                                        draft[index] = defaultResourceAtrributeOptions(detail.value)
                                      })
                                      if (detail.value) {
                                        fetchResourceAttributeOptions(generatedPolicy?.meta?.required_provider?.split("/")?.[1], selectedCloudProvider[index]?.value, detail.value)
                                      }
                                    }}
                                  />
                                </FormField>
                              </Box>
                            </Box>

                            <FormField
                              label={
                                <SpaceBetween size="xs" direction="horizontal">
                                  Terraform Resource Attribute
                                  {getSelectedResourceTypeOption(
                                    generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_attribute,
                                    resourceAttributeOptions?.[generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_type] || []
                                  )?.iconName === "status-warning" ? (
                                    <TextContent>
                                      <Icon name="status-warning" variant="subtle" />
                                      Computed attributes may not be detectable in the terraform plan
                                    </TextContent>
                                  ) : null}
                                </SpaceBetween>
                              }
                            >
                              <Autosuggest
                                disabled={disabled}
                                value={generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_attribute}
                                enteredTextLabel={value => `Use: "${value}"`}
                                virtualScroll
                                expandToViewport
                                options={getTfResourceTypeOptions(resourceAttributeOptions?.[generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_type] || [])}
                                placeholder="Search Resource Attribute"
                                onChange={({ detail }) => {
                                  setGeneratedPolicy(draft => {
                                    draft.evaluators[index].provider_args.terraform_resource_attribute = detail.value
                                  })
                                }}
                              />
                            </FormField>
                          </>
                        )}

                        {generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" &&
                          ["action", "count", "direct_references", "direct_dependencies"].includes(generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type) && (
                            <Box display={"flex"} flexDirection="row" width={"66%"}>
                              <Box flex={0.5} mr={2}>
                                <FormField label="Cloud Provider">
                                  <Select
                                    filteringType="auto"
                                    disabled={disabled}
                                    selectedOption={selectedCloudProvider[index]}
                                    onChange={({ detail }) => {
                                      setSelectedCloudProvider(draft => {
                                        draft[index] = detail.selectedOption
                                      })
                                      fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], detail.selectedOption.value)
                                    }}
                                    options={cloudProviderOptions}
                                    selectedAriaLabel="Select Cloud Provider"
                                    placeholder="Select Cloud Provider"
                                  />
                                </FormField>
                              </Box>

                              <Box flex={2}>
                                <FormField label="Terraform Resource Type">
                                  <Autosuggest
                                    disabled={disabled}
                                    value={generatedPolicy?.evaluators[index]?.provider_args?.terraform_resource_type}
                                    enteredTextLabel={value => `Use: "${value}"`}
                                    virtualScroll
                                    expandToViewport
                                    options={cloudResourcesList?.[selectedCloudProvider[index]?.value] || []}
                                    placeholder="Search Resource"
                                    onChange={({ detail }) => {
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args.terraform_resource_type = detail.value
                                      })
                                      setterraformResourceAttributeOptions(draft => {
                                        draft[index] = defaultResourceAtrributeOptions(detail.value)
                                      })
                                      if (detail.value) {
                                        fetchResourceAttributeOptions(generatedPolicy?.meta?.required_provider?.split("/")?.[1], selectedCloudProvider[index]?.value, detail.value)
                                      }
                                    }}
                                  />
                                </FormField>
                              </Box>
                            </Box>
                          )}

                        {generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" &&
                          ["direct_references"].includes(generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type) && (
                            <Box display={"flex"} flexDirection="row" width={"66%"} mt={1}>
                              <Box flex={0.5}>
                                <ButtonDropdown
                                  variant="normal"
                                  items={[
                                    { text: "References to", id: "references_to" },
                                    { text: "Referenced by", id: "referenced_by" }
                                  ]}
                                  onItemClick={({ detail }) => {
                                    if (detail.id === "references_to") {
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args["references_to"] = ""
                                        delete draft.evaluators[index].provider_args["referenced_by"]
                                      })
                                    }
                                    if (detail.id === "referenced_by") {
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args["referenced_by"] = ""
                                        delete draft.evaluators[index].provider_args["references_to"]
                                      })
                                    }
                                  }}
                                >
                                  {getButtonDropDownSelection(generatedPolicy?.evaluators?.[index]?.provider_args)}
                                </ButtonDropdown>
                              </Box>
                              <Box flex={1}>
                                <Autosuggest
                                  disabled={disabled}
                                  value={generatedPolicy?.evaluators[index]?.provider_args?.references_to || generatedPolicy?.evaluators[index]?.provider_args?.referenced_by || ""}
                                  enteredTextLabel={value => `Use: "${value}"`}
                                  virtualScroll
                                  expandToViewport
                                  options={cloudResourcesList?.[selectedCloudProvider[index]?.value] || []}
                                  placeholder="Search Resource"
                                  onChange={({ detail }) => {
                                    setGeneratedPolicy(draft => {
                                      if (getButtonDropDownSelection(generatedPolicy?.evaluators?.[index]?.provider_args) === "Referenced by") {
                                        draft.evaluators[index].provider_args["referenced_by"] = detail.value
                                      } else if (getButtonDropDownSelection(generatedPolicy?.evaluators?.[index]?.provider_args) === "References to") {
                                        draft.evaluators[index].provider_args["references_to"] = detail.value
                                      }
                                    })
                                  }}
                                />
                              </Box>
                            </Box>
                          )}

                        {generatedPolicy?.meta?.required_provider === "stackguardian/infracost" &&
                          (generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type === "total_monthly_cost" ||
                            generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type === "total_hourly_cost") && (
                            <Box display={"flex"} flexDirection="row" width={"66%"}>
                              <Box flex={0.5} mr={2}>
                                <FormField label="Cloud Provider">
                                  <Select
                                    filteringType="auto"
                                    disabled={disabled}
                                    selectedOption={selectedCloudProvider[index]}
                                    onChange={({ detail }) => {
                                      setSelectedCloudProvider(draft => {
                                        draft[index] = detail.selectedOption
                                      })
                                      fetchCloudResources(generatedPolicy?.meta?.required_provider?.split("/")?.[1], detail.selectedOption.value)
                                    }}
                                    options={cloudProviderOptions}
                                    selectedAriaLabel="Select Cloud Provider"
                                    placeholder="Select Cloud Provider"
                                  />
                                </FormField>
                              </Box>

                              <Box flex={2}>
                                <FormField label="Resource Type">
                                  <CustomMultiSelect
                                    disabled={disabled}
                                    selectedOptions={
                                      generatedPolicy?.evaluators[index]?.provider_args?.resource_type?.map(item => {
                                        return {
                                          label: item,
                                          value: item
                                        }
                                      }) || []
                                    }
                                    enteredTextLabel={value => `Use: "${value}"`}
                                    virtualScroll
                                    deselectAriaLabel={e => `Remove ${e.label}`}
                                    options={
                                      cloudResourcesList?.[selectedCloudProvider?.[index]?.value] ? [{ label: "All", value: "*" }, ...cloudResourcesList?.[selectedCloudProvider?.[index]?.value]] : []
                                    }
                                    placeholder="Choose Resources"
                                    filteringType="manual"
                                    onChange={({ detail }) => {
                                      setGeneratedPolicy(draft => {
                                        draft.evaluators[index].provider_args.resource_type = detail.selectedOptions.map(option => {
                                          return option.value
                                        })
                                      })
                                      // setterraformResourceAttributeOptions(draft => {
                                      //   draft[index] = defaultResourceAtrributeOptions(detail.value);
                                      // });
                                    }}
                                  />
                                </FormField>
                              </Box>
                            </Box>
                          )}

                        <FormField
                          label={
                            generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" && generatedPolicy?.evaluators?.[index]?.provider_args?.operation_type === "action" ? (
                              <>
                                Condition Type&nbsp;
                                <Popover
                                  header="Condition Type"
                                  content={
                                    <>
                                      Condition Type for checking terraform action.
                                      <br></br>Example:
                                      <br></br>["delete", "create", "read", "update"]
                                    </>
                                  }
                                >
                                  <StatusIndicator type="info"></StatusIndicator>
                                </Popover>
                              </>
                            ) : (
                              "Condition Type"
                            )
                          }
                        >
                          <Select
                            filteringType="auto"
                            disabled={disabled}
                            selectedOption={evaluatorOptions.find(val => val.value === generatedPolicy?.evaluators?.[index]?.condition?.type) || ""}
                            onChange={({ detail }) => {
                              setGeneratedPolicy(draft => {
                                draft.evaluators[index].condition.type = detail.selectedOption.value
                              })
                            }}
                            options={evaluatorOptions}
                            selectedAriaLabel="Select Condition Type"
                            placeholder="Select Condition Type"
                          />
                        </FormField>
                        <FormField label="Condition Value">
                          <Textarea
                            disabled={disabled}
                            onChange={({ detail }) => {
                              let finalVal
                              try {
                                finalVal = JSON.parse(detail.value)
                              } catch (e) {
                                console.log("could not catch val")
                                finalVal = detail.value
                              }
                              setGeneratedPolicy(draft => {
                                draft.evaluators[index].condition.value = typeof finalVal === "object" ? finalVal : finalVal === "true" || (finalVal === "false" ? false : finalVal)
                              })
                            }}
                            value={
                              typeof generatedPolicy?.evaluators?.[index]?.condition?.value === "string"
                                ? generatedPolicy?.evaluators?.[index]?.condition?.value
                                : JSON.stringify(generatedPolicy?.evaluators?.[index]?.condition?.value)
                            }
                          />
                        </FormField>
                        {generatedPolicy?.meta?.required_provider === "stackguardian/terraform_plan" && (
                          <FormField
                            label={
                              <>
                                Error Tolerance Value&nbsp;
                                <Popover
                                  header="Error Tolerance Value (default: 0)"
                                  content={
                                    <>
                                      Currently, this only affects Terraform Plan provider.
                                      <br></br>
                                      Setting the error tolerance value is useful when we want to mark the errored evaluator as skip instead of failing when the evaluator errored.
                                      <br></br>
                                      For example terraform_plan provider has the following error values:
                                      <br></br>1 = when the resource type is not found
                                      <br></br>2 = when the attribute of the resource is not found
                                      <br></br>
                                      If <code>error_tolerance &gt;= error_value</code>, the evaluator will be skipped instead of failing.
                                      <br></br>
                                      For example, by setting the error tolerance to 2, if the specified attribute of the resource type is not found OR when the resource is not found, the evaluator
                                      will be skipped instead of failing.
                                    </>
                                  }
                                >
                                  <StatusIndicator type="info"></StatusIndicator>
                                </Popover>
                              </>
                            }
                          >
                            <Input
                              disabled={disabled}
                              onChange={({ detail }) => {
                                if (detail.value === "") detail.value = 0
                                if (isNaN(detail.value)) return
                                setGeneratedPolicy(draft => {
                                  draft.evaluators[index].condition.error_tolerance = parseInt(detail.value)
                                })
                              }}
                              value={generatedPolicy?.evaluators?.[index]?.condition?.error_tolerance}
                            />
                          </FormField>
                        )}
                        <SpaceBetween direction="horizontal" size="xs">
                          <Button
                            disabled={disabled}
                            variant="normal"
                            onClick={() => {
                              setGeneratedPolicy(draft => {
                                try {
                                  let evalId = draft.evaluators[index]?.id
                                  if (draft.eval_expression !== "") {
                                    let new_eval_exp = draft.eval_expression
                                      .replace(`${evalId}`, "")
                                      .replace(" &&  && ", " && ")
                                      .replace(/^ &&+|&& +$/g, "")
                                    draft.eval_expression = new_eval_exp?.trim()
                                  }
                                } catch (err) {
                                  console.log("Error while removing evalId from eval_expression")
                                }
                                draft.evaluators.splice(index, 1)
                              })
                            }}
                          >
                            Remove Evaluator
                          </Button>
                        </SpaceBetween>
                      </SpaceBetween>
                    </Container>
                  )
                })}

                <SpaceBetween direction="horizontal" size="xs">
                  <Button
                    disabled={disabled}
                    variant="primary"
                    onClick={() => {
                      setGeneratedPolicy(draft => {
                        let newEvaluatorObj
                        if (draft.meta.required_provider === "stackguardian/json") {
                          newEvaluatorObj = JSON.parse(JSON.stringify(empty_evaluator_obj_json))
                        } else if (draft.meta.required_provider === "stackguardian/kubernetes") {
                          newEvaluatorObj = JSON.parse(JSON.stringify(empty_evaluator_obj__kubernetes))
                        } else {
                          newEvaluatorObj = JSON.parse(JSON.stringify(empty_evaluator_obj))
                        }
                        let eval_index = draft?.evaluators?.length + 1 || 1
                        let evalId = `eval-id-${eval_index}`
                        newEvaluatorObj.id = evalId
                        draft.evaluators.push(newEvaluatorObj)

                        if (draft.eval_expression.trim() === "") {
                          draft.eval_expression = evalId
                        } else {
                          draft.eval_expression += ` && ${evalId}`
                        }
                      })
                    }}
                  >
                    Add Evaluator
                  </Button>
                </SpaceBetween>
                {showEvalExpressionWarning && <Alert statusIconAriaLabel="Info">{`Some of the evaluators are not present in final expression`}</Alert>}

                <FormField label="Final Expression*" description="Expression for final evaluation of Tirith policy, eg: check_id_1 && check_id_2 || !check_id_3">
                  <Input
                    disabled={disabled}
                    onChange={({ detail }) => {
                      setGeneratedPolicy(draft => {
                        draft.eval_expression = detail.value
                      })
                    }}
                    value={generatedPolicy?.eval_expression}
                  />
                </FormField>
              </SpaceBetween>
            </SpaceBetween>
          </Box>
        </Form>
      </form>
      <Modal
        visible={isShowPolicyJSON}
        onDismiss={() => {
          setIsShowPolicyJSON(false)
        }}
        footer={
          <CSBox float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="copy" onClick={() => handleCopyPolicyJSON(JSON.stringify(generatedPolicy || "{}", null, 2))}>
                Copy
              </Button>
            </SpaceBetween>
          </CSBox>
        }
        header="Policy JSON"
      >
        <MonacoEditorWidget readOnly size={{ width: "100%", height: "40vh" }} value={JSON.stringify(generatedPolicy || "{}", null, 2)} />
      </Modal>
    </Box>
  )
}

const TirithPolicyBuilderWrapper = props => {
  return (
    <CustomErrorBoundary title="Unable to render Tirith Builder form">
      <TirithPolicyBuilder {...props} />
    </CustomErrorBoundary>
  )
}

export default TirithPolicyBuilderWrapper
